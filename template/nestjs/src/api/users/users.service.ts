import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { enums } from '../../constructs';
import {
  ChangeUserPasswordRequestDto,
  CreateUserByAdminRequestDto,
  ListUsersRequestDto,
  ResetForgotAccountPassword,
  UpdatePasswordDto,
  UpdateStatusDto,
  UpdateUserByAdminRequestDto,
} from '../../dto/request/user-request.dto';
import { getPagination, hexCode, removeNulls } from '../../helpers/utils';
import {
  RequestResponseDto,
  ResultResponseDto,
} from '../../dto/response/base-response-dto';
import { User } from '../../model/users.model';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { AuthUserDto } from 'src/dto/others/auth.response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async login(user: string): Promise<User> {
    return await this.userRepository.findOne({
      where: [
        { emailAddress: user, status: enums.AccountStatusEnum.ACTIVE },
        { phoneNumber: user, status: enums.AccountStatusEnum.ACTIVE },
      ],
    });
  }

  async statisticsCount(user: AuthUserDto): Promise<{ count: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), parameters);
    }

    const count = await query.getCount();
    return {
      count: count,
    };
  }

  async findAll(
    data: ListUsersRequestDto,
    user: AuthUserDto,
  ): Promise<ResultResponseDto> {
    const search = data.search ?? null;
    const limit = Number(data.resultPerPage || 10);
    const page = Number(data.page || 1);
    const offset = (page - 1) * limit;
    const status = data.status ?? null;

    const query = this.userRepository.createQueryBuilder('user');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    // Add search conditions
    if (search) {
      conditions.push(`(user.firstName ILIKE :search OR 
          user.lastName ILIKE :search OR 
          user.middleName ILIKE :search OR 
          user.phoneNumber ILIKE :search OR 
          user.emailAddress ILIKE :search)`);
      parameters.search = search;
    }

    if (status) {
      conditions.push('user.status = :status');
      parameters.status = status;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), parameters);
    }

    // Pagination and sorting
    query
      .orderBy('user.id', 'DESC')
      .take(limit)
      .skip(offset)

      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.middleName',
        'user.emailAddress',
        'user.phoneNumber',
        'user.status',
      ]); // Excluding sensitive data like password

    const [result, count] = await query.getManyAndCount();
    const freezedResult = result.map((user) => new UserResponseDto(user));

    return {
      result: freezedResult,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async single(id: number): Promise<UserResponseDto> {
    const query = this.userRepository.createQueryBuilder('user');

    query.where(`user.id = :id`, { id });
    query
      .orderBy('user.id', 'DESC')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.middleName',
        'user.emailAddress',
        'user.phoneNumber',
        'user.isTwoFactorEnabled',
        'user.status',
      ]);

    const user = await query.getOne();
    return new UserResponseDto(user);
  }

  async findOne(data: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: [{ emailAddress: data }, { phoneNumber: data }],
    });
    if (!user) throw new NotFoundException('Account not found');
    return new UserResponseDto(user);
  }

  async resetAccountPassword(
    data: ChangeUserPasswordRequestDto,
    user?: any,
  ): Promise<RequestResponseDto> {
    const _user = await this.userRepository.findOne({
      where: { id: data.userId },
      select: ['password'],
    });

    if (!_user) {
      throw new NotFoundException('No data found with given credentials');
    }

    const newPassword = hexCode({ count: 8, strong: true });
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // Find user within transaction
      const record = await queryRunner.manager.findOne(User, {
        where: { id: data.userId },
      });

      if (!record) {
        throw new NotFoundException('User not found');
      }

      // Update user password
      record.password = hashedPassword;
      record.requirePasswordChange = true;
      await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return { success: true, message: 'Record updated successfully ' };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async resetForgotAccountPassword(
    data: ResetForgotAccountPassword,
  ): Promise<RequestResponseDto> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const record = await this.userRepository.findOne({
        where: { emailAddress: data.email },
      });
      if (!record) {
        throw new NotFoundException('Account not found');
      }

      // Update user password
      record.password = hashedPassword;
      await queryRunner.manager.save(record);

      await queryRunner.commitTransaction();

      return { success: true, message: 'Record updated successfully ' };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(
    data: CreateUserByAdminRequestDto,
    user: AuthUserDto,
  ): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      data.status = enums.AccountStatusEnum.ACTIVE;

      // A random password is generated | hashed | saved for the user
      const generatedPassword = hexCode({ count: 8, strong: true });
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      data.password = hashedPassword;

      const newUser = this.userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber,
        password: data.password,
        requirePasswordChange: true,
        gender: data.gender,
      });
      await queryRunner.manager.save(User, newUser);

      await queryRunner.commitTransaction();
      return new UserResponseDto(newUser);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(
    data: UpdateUserByAdminRequestDto,
    user: AuthUserDto,
  ): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: data.id },
      });
      if (!existingUser) {
        throw new ConflictException('User does not exist');
      }

      // Update User status
      Object.assign(existingUser, removeNulls(data));
      await queryRunner.manager.save(User, existingUser);

      await queryRunner.commitTransaction();
      return new UserResponseDto(existingUser);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(data: UpdatePasswordDto): Promise<RequestResponseDto> {
    //^ Find the user by ID and select the password field
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
      select: ['password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    //^ Compare the current password with the stored hash
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new NotAcceptableException('Incorrect password');
    }

    //^ Set variables
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    //^ Start a transaction
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Update the user's password and reset the `re` field
      await queryRunner.manager.update(
        User,
        { id: data.userId },
        { password: hashedPassword, requirePasswordChange: false },
      );

      // Commit the transaction
      await queryRunner.commitTransaction();
      //^ Return the result
      return { success: true, message: 'Record updated successfully' };
    } catch (error: any) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateStatus(
    dto: UpdateStatusDto,
    user: AuthUserDto,
  ): Promise<UserResponseDto> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if PHC exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: dto.id },
      });
      if (!existingUser) {
        throw new ConflictException('User does not exist');
      }

      // Update User status
      Object.assign(existingUser, {
        status: dto.status,
      });
      const updateUser = await queryRunner.manager.save(existingUser);

      await queryRunner.commitTransaction();
      return new UserResponseDto(updateUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
