import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ResultResponseDto } from '../../dto/response/base-response-dto';
import { GroupService } from './groups.service';
import { AuthUserDto } from '../../dto/others/auth.response.dto';
import { GroupDto, ListGroupsRequestDto, UpdateGroupDto } from '../../dto/request/groups-request.dto';

@Controller('/groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get('/statistics/count')
  async statisticsCount(@Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.groupService.statisticsCount(user);
  }

  @Post('/')
  async createGroup(@Body() groupDto: GroupDto) {
    return await this.groupService.createGroup(groupDto);
  }

  @Get('/')
  async findAll(
    @Query() data: ListGroupsRequestDto,
  ): Promise<ResultResponseDto> {
    return await this.groupService.findAll(data);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.groupService.findOne(id);
  }

  @Delete('/:id')
  async deleteGroup(
    @Param('id', ParseIntPipe) groupId: number,
    @Req() request: any,
  ) {
    const user: AuthUserDto = request?.user;
    return await this.groupService.deleteGroup(groupId, user);
  }

  @Patch('/update')
  async updateGroup(@Body() updateGroupDto: UpdateGroupDto, @Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.groupService.updateGroup(updateGroupDto, user);
  }
}
