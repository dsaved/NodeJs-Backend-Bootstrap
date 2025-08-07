import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log, Group } from '../../model';
import { Repository } from 'typeorm';
import { getPagination } from '../../helpers/utils';
import { MESSAGES } from '../../constructs/messages';
import { AuthUserDto } from '../../dto/others/auth.response.dto';
import { auditAction } from '../../constructs/constant';
import {
  RequestResponseDto,
  ResultResponseDto,
} from '../../dto/response/base-response-dto';
import { constant } from '../../constructs';
import {
  GroupDto,
  ListGroupsRequestDto,
  UpdateGroupDto,
} from '../../dto/request/groups-request.dto';
import { GroupsResponseDto } from '../../dto/response/groups-response.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async statisticsCount(user: AuthUserDto): Promise<{ count: number }> {
    const count = await this.groupRepository
      .createQueryBuilder('group')
      .getCount();
    return { count };
  }

  async createGroup(groupDto: GroupDto): Promise<Group> {
    try {
      const { groupName, scopeLevel } = groupDto;
      const group = this.groupRepository.create({
        groupName,
        scopeLevel,
      });

      return await this.groupRepository.save(group);
    } catch (error: any) {
      if (error.code === constant.duplicateErrorKey) {
        throw new ConflictException(error?.detail);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(data: ListGroupsRequestDto): Promise<ResultResponseDto> {
    try {
      const search = data.search || null;
      const limit = Number(data.resultPerPage || 10);
      const page = Number(data.page || 1);
      const offset = (page - 1) * limit;

      const query = this.groupRepository.createQueryBuilder('group');

      // Add search conditions
      if (search) {
        query.where('group.groupName ILIKE :search', { search: `%${search}%` });
      }

      // Pagination and sorting
      query
        .orderBy('group.id', 'DESC')
        .take(limit)
        .skip(offset)
        .select([
          'group.id',
          'group.groupName',
          'group.createdAt',
          'group.updatedAt',
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
  async findOne(id: number): Promise<GroupsResponseDto> {
    const groups = await this.groupRepository.findOne({
      where: { id },
    });

    if (!groups) {
      throw new NotFoundException(MESSAGES.record_not_found);
    }

    return new GroupsResponseDto(groups);
  }

  async deleteGroup(
    groupId: number,
    user: AuthUserDto,
  ): Promise<RequestResponseDto> {
    //^ Start a transaction
    const queryRunner =
      this.groupRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
      });

      if (!group) {
        throw new InternalServerErrorException('Group not found.');
      }

      // Check if the group is assigned to any role
      const isAssigned = await queryRunner.manager
        .createQueryBuilder(Group, 'group')
        .innerJoin('roles', 'role', 'role.group_id = group.id')
        .where('group.id = :groupId', { groupId })
        .getExists();

      if (isAssigned) {
        throw new InternalServerErrorException(
          'Group cannot be deleted as it is assigned to one or more users.',
        );
      }

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          user: { id: user.userId },
          action: auditAction.RECORD_DELETE,
          description: `Delted a group, id=(${groupId})`,
        }),
      );

      // Delete the group
      await queryRunner.manager.delete(Group, { id: groupId });

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

  async updateGroup(
    updateGroupDto: UpdateGroupDto,
    user: AuthUserDto,
  ): Promise<RequestResponseDto> {
    // Start a transaction
    const queryRunner =
      this.groupRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: updateGroupDto.id },
      });

      if (!group) {
        throw new NotFoundException(MESSAGES.record_not_found);
      }

      // Log the action
      await queryRunner.manager.save(
        queryRunner.manager.create(Log, {
          user: { id: user.userId },
          rowId: group.id,
          action: auditAction.RECORD_MODIFIED,
          description: `This record was modified, id=(${updateGroupDto.id})`,
        }),
      );

      //Update the group
      const updatedGroup = { ...group, ...updateGroupDto };
      await queryRunner.manager.save(Group, updatedGroup);

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
