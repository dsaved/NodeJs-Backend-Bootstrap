import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log, Role } from '../../model';
import { Repository } from 'typeorm';
import {
  RoleDto,
  ListRolesRequestDto,
  UpdateRoleDto,
} from '../../dto/request/roles-request.dto';
import { getPagination, removeNulls } from '../../helpers/utils';
import { MESSAGES } from '../../constructs/messages';
import { AuthUserDto } from '../../dto/others/auth.response.dto';
import { auditAction } from '../../constructs/constant';
import {
  RequestResponseDto,
  ResultResponseDto,
} from '../../dto/response/base-response-dto';
import { RolesResponseDto } from '../../dto/response/roles-response.dto';
import { constant } from '../../constructs';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async statisticsCount(user: AuthUserDto): Promise<{ count: number }> {
    const query = this.roleRepository.createQueryBuilder('role');

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    if (user.stateId) {
      conditions.push('role.state_id = :stateId');
      parameters.stateId = user.stateId;
    }

    if (user.lgaId) {
      conditions.push('role.lga_id = :lgaId');
      parameters.lgaId = user.lgaId;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), parameters);
    }

    const count = await query.getCount();
    return {
      count: count,
    };
  }

  async createRole(roleDto: RoleDto, user: AuthUserDto): Promise<Role> {
    try {
      const { role: userRole } = user;
      const { roleName, permission, state, lga } = roleDto;
      const groupFromUser = userRole?.group?.id; // Optional user override
      const groupFromDto = roleDto.group; // Default from DTO
      const group = groupFromDto;

      const role = this.roleRepository.create({
        roleName,
        permission,
        ...removeNulls({
          group: { id: group },
          lga: lga ? { id: lga } : null,
          state: state ? { id: state } : null,
        }),
      });

      return await this.roleRepository.save(role);
    } catch (error: any) {
      if (error.code === constant.duplicateErrorKey) {
        throw new ConflictException(error?.detail);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(
    data: ListRolesRequestDto,
    user: AuthUserDto,
  ): Promise<ResultResponseDto> {
    try {
      const search = data.search || null;
      const limit = Number(data.resultPerPage || 10);
      const page = Number(data.page || 1);
      const offset = (page - 1) * limit;

      const query = this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.group', 'group', 'role.group_id = group.id');

      const conditions: string[] = [];
      const parameters: Record<string, any> = {};

      if (user.stateId) {
        conditions.push('role.state_id = :stateId');
        parameters.stateId = user.stateId;
      }

      if (user.lgaId) {
        conditions.push('role.lga_id = :lgaId');
        parameters.lgaId = user.lgaId;
      }

      // Add search conditions
      if (search) {
        conditions.push('role.roleName ILIKE :search');
        parameters.search = search;
      }

      if (conditions.length > 0) {
        query.where(conditions.join(' AND '), parameters);
      }

      // Pagination and sorting
      query
        .orderBy('role.id', 'DESC')
        .take(limit)
        .skip(offset)
        .select([
          'role.id',
          'role.roleName',
          'role.permission',
          'group.groupName',
          'role.createdAt',
        ]);

      const [result, count] = await query.getManyAndCount();

      return {
        result,
        pagination: getPagination(count, page, offset, limit),
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findOne(id: number): Promise<RolesResponseDto> {
    const roles = await this.roleRepository.findOne({
      where: { id },
      relations: {
        group: true,
        lga: true,
        state: true,
      },
    });

    if (!roles) {
      throw new NotFoundException(MESSAGES.record_not_found);
    }

    return new RolesResponseDto(roles);
  }

  async deleteRole(
    roleId: number,
    user: AuthUserDto,
  ): Promise<RequestResponseDto> {
    //^ Start a transaction
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
      });

      if (!role) {
        throw new InternalServerErrorException('Role not found.');
      }

      // Check if the role is assigned to any users
      const isAssigned = await queryRunner.manager
        .createQueryBuilder(Role, 'role')
        .innerJoin('users', 'user', 'user.role_id = role.id')
        .where('role.id = :roleId', { roleId })
        .getExists();

      if (isAssigned) {
        throw new InternalServerErrorException(
          'Role cannot be deleted as it is assigned to one or more users.',
        );
      }

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          user: { id: user.userId },
          action: auditAction.RECORD_DELETE,
          description: `Delted a role, id=(${roleId})`,
        }),
      );

      // Delete the role
      await queryRunner.manager.delete(Role, { id: roleId });

      // Commit the transaction
      await queryRunner.commitTransaction();
      //^ Return the result
      return { success: true, message: MESSAGES.record_count_delete(1, 1) };
    } catch (error: any) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateRole(
    updateRoleDto: UpdateRoleDto,
    user: AuthUserDto,
  ): Promise<RequestResponseDto> {
    // Start a transaction
    const queryRunner =
      this.roleRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: updateRoleDto.id },
      });

      if (!role) {
        throw new NotFoundException(MESSAGES.record_not_found);
      }

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          user: { id: user.userId },
          rowId: role.id,
          action: auditAction.RECORD_MODIFIED,
          description: `This record was modified, id=(${updateRoleDto.id})`,
        }),
      );

      //Update the role
      Object.assign(
        role,
        removeNulls({
          ...updateRoleDto,
          group: updateRoleDto.group ? { id: updateRoleDto.group } : null,
          lga: updateRoleDto.lga ? { id: updateRoleDto.lga } : null,
          state: updateRoleDto.state ? { id: updateRoleDto.state } : null,
        }),
      );

      await queryRunner.manager.save(Role, role);

      // Commit the transaction
      await queryRunner.commitTransaction();
      return { success: true, message: MESSAGES.record_updated };
    } catch (error: any) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
