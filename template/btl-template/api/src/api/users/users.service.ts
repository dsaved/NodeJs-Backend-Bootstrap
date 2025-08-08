import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { constant, enums } from '../../constructs';
import {
  ChangeUserPasswordRequestDto,
  CreateUserByAdminRequestDto,
  ListUsersRequestDto,
  ResetForgotAccountPassword,
  UpdatePasswordDto,
  UpdateStatusDto,
  UpdateUserByAdminRequestDto,
} from '../../dto/request/user-request.dto';
import { MESSAGES } from '../../constructs/messages';
import { auditAction } from '../../constructs/constant';
import mailHelper from '../../helpers/mail.helper';
import { getPagination, hexCode, removeNulls } from '../../helpers/utils';
import {
  RequestResponseDto,
  ResultResponseDto,
} from '../../dto/response/base-response-dto';
import { User } from '../../model/users.model';
import { Log } from '../../model/logs.model';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { AuthUserDto } from 'src/dto/others/auth.response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
    private readonly dataSource: DataSource,
  ) {}

  async login(user: string): Promise<User> {
    return await this.userRepository.findOne({
      where: [
        { emailAddress: user, status: enums.AccountStatusEnumNum.active },
        { phoneNumber: user, status: enums.AccountStatusEnumNum.active },
      ],
      relations: {
        state: true,
        lga: true,
        zone: true,
        role: true,
      },
      select: {
        state: {
          id: true,
          stateName: true,
        },
        lga: {
          id: true,
        },
        zone: {
          id: true,
          zoneName: true,
        },
        role: {
          id: true,
          roleName: true,
        },
      },
    });
  }

  async statisticsCount(user: AuthUserDto): Promise<{ count: number }> {
    const query = this.userRepository.createQueryBuilder('user');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (user.stateId) {
      conditions.push('user.state_id = :stateId');
      parameters.stateId = user.stateId;
    }

    if (user.lgaId) {
      conditions.push('user.lga_id = :lgaId');
      parameters.lgaId = user.lgaId;
    }

    if (user.wardId) {
      conditions.push('user.ward_id = :wardId');
      parameters.wardId = user.wardId;
    }

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
    const roleId = data.roleId ?? null;
    const groupId = data.groupId ?? null;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.ward', 'ward')
      .leftJoinAndSelect('user.group', 'group');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (user.stateId) {
      conditions.push('user.state_id = :stateId');
      parameters.stateId = user.stateId;
    }

    if (user.lgaId) {
      conditions.push('user.lga_id = :lgaId');
      parameters.lgaId = user.lgaId;
    }

    if (user.wardId) {
      conditions.push('user.ward_id = :wardId');
      parameters.wardId = user.wardId;
    }

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
      parameters.status = enums.AccountStatusEnumNum[status];
    }

    if (roleId) {
      conditions.push('user.role_id = :roleId');
      parameters.roleId = roleId;
    }

    if (groupId) {
      conditions.push('user.group_id = :groupId');
      parameters.groupId = groupId;
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
        'role',
        'group',
        'ward.id',
        'ward.wardName',
      ]); // Excluding sensitive data like password

    const [result, count] = await query.getManyAndCount();
    const freezedResult = result.map((user) => new UserResponseDto(user));

    return {
      result: freezedResult,
      pagination: getPagination(count, page, offset, limit),
    };
  }

  async single(id: number): Promise<UserResponseDto> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.group', 'group')
      .leftJoinAndSelect('user.ward', 'ward');

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
        'role',
        'group',
        'ward.id',
        'ward.wardName',
      ]);

    const user = await query.getOne();
    return new UserResponseDto(user);
  }

  async findOne(data: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: [{ emailAddress: data }, { phoneNumber: data }],
      relations: {
        state: true,
        lga: true,
        zone: true,
        ward: true,
        role: true,
      },
      select: {
        state: {
          id: true,
          stateName: true,
          stateCode: true,
        },
        lga: {
          id: true,
          lgaCode: true,
          lgaName: true,
        },
        zone: {
          id: true,
          zoneName: true,
        },
        ward: {
          id: true,
          wardName: true,
        },
      },
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

      // Send email notification
      await mailHelper
        .setSubject('Account password reset successfully')
        .setMessage(
          `<p>Your account's password has been reset by the administrator of the system.</p>
          <p>Use this details for your user access: <br/>
          Email: <b>${record.emailAddress}</b>
          <br/>Password: <b>${newPassword}</b><br/> </p>`,
        )
        .setTo(record.emailAddress)
        .enque(queryRunner);

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          userId: user?.userId ?? record.id,
          action: auditAction.RECORD_MODIFIED,
          description: `Updated a user's password, id=(${record.id})`,
        }),
      );

      await queryRunner.commitTransaction();

      return { success: true, message: MESSAGES.update_successful };
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

      // Send email notification
      await mailHelper
        .setSubject('Account password reset successfully')
        .setMessage(
          `<p>Your account's password has been succefully changed</p>
          <p>Use this details for your user access: <br/>
          Email: <b>${record.emailAddress}</b>
          <br/>Password: <b>${data.password}</b><br/> </p>`,
        )
        .setTo(record.emailAddress)
        .enque(queryRunner);

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          userId: record.id,
          action: auditAction.RECORD_MODIFIED,
          description: `Reset own password, id=(${record.id})`,
        }),
      );

      await queryRunner.commitTransaction();

      return { success: true, message: MESSAGES.update_successful };
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
      data.status = enums.AccountStatusEnumNum.active;

      // A random password is generated | hashed | saved for the user
      const generatedPassword = hexCode({ count: 8, strong: true });
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      data.password = hashedPassword;

      const name = [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(' ');

      const newUser = this.userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        emailAddress: data.emailAddress,
        phoneNumber: data.phoneNumber,
        password: data.password,
        zone: data.zone ? { id: data.zone } : null,
        state: data.state ? { id: data.state } : null,
        role: data.role ? { id: data.role } : null,
        ward: data.ward ? { id: data.ward } : null,
        lga: data.lga ? { id: data.lga } : null,
        group: data.group ? { id: data.group } : null,
        requirePasswordChange: true,
        gender: enums.GenderEnumNum[data.gender],
      });
      await queryRunner.manager.save(User, newUser);

      // send an email to the user with the password
      await mailHelper
        .setSubject('Account created successfully')
        .setMessage(
          `
    <p>Hello ${name},</p>
    <p>An administrator has created an account for you,granting you admin-level access to our platform. We're excited to have you on board.</p>
    <p>Kindly use the credentials provided to log in to your account. For security reasons, you are required to reset your password upon your first successful login.</p>
    <p><strong>Your login details:</strong><br>
      Email: <b>${data.emailAddress}</b><br>
      Password: <b>${generatedPassword}</b>
    </p>
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>Log in using your credentials.</li>
      <li>Reset your password to ensure account security.</li>
      <li>Explore the admin dashboard and familiarize yourself with the tools available.</li>
    </ol>
  `,
        )
        .setTo(data.emailAddress)
        .enque(queryRunner);

      // Log the action
      await queryRunner.manager.save(Log, {
        userId: user.userId,
        action: auditAction.RECORD_ADD,
        rowId: newUser.id,
        tableName: 'users',
        description: `Created a new user record, id=(${newUser.id})`,
      });

      await queryRunner.commitTransaction();
      return new UserResponseDto(newUser);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (error.code === constant.duplicateErrorKey) {
        throw new ConflictException(error?.detail);
      }
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
      Object.assign(existingUser, {
        ...removeNulls({
          ...data,
          role: data.role ? { id: data.role } : null,
          gender: data.gender ? enums.GenderEnumNum[data.gender] : null,
        }),
        state: data.state ? { id: data.state } : null,
        ward: data.ward ? { id: data.ward } : null,
        lga: data.lga ? { id: data.lga } : null,
        phc: data.phc ? { id: data.phc } : null,
      });
      await queryRunner.manager.save(User, existingUser);

      // Log the action
      await queryRunner.manager.save(Log, {
        userId: user.userId,
        action: auditAction.RECORD_ADD,
        rowId: existingUser.id,
        tableName: 'users',
        description: `updated a new user record, id=(${existingUser.id})`,
      });

      await queryRunner.commitTransaction();
      return new UserResponseDto(existingUser);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (error.code === constant.duplicateErrorKey) {
        throw new ConflictException(error?.detail);
      }
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

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          userId: data.userId,
          action: auditAction.RECORD_MODIFIED,
          description: `Updated a user's password, id=(${data.userId})`,
        }),
      );

      // Commit the transaction
      await queryRunner.commitTransaction();
      //^ Return the result
      return { success: true, message: MESSAGES.update_successful };
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
        status: enums.AccountStatusEnumNum[dto.status],
      });
      const updateUser = await queryRunner.manager.save(existingUser);

      // Log the action
      await queryRunner.manager.save(Log, {
        userId: user.userId,
        action: auditAction.RECORD_MODIFIED,
        rowId: updateUser.id,
        tableName: 'phc',
        description: ` set record to ${dto.status}, id=(${updateUser.id})`,
      });

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
