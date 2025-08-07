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
import {
  ListRolesRequestDto,
  RoleDto,
  UpdateRoleDto,
} from '../../dto/request/roles-request.dto';
import { ResultResponseDto } from '../../dto/response/base-response-dto';
import { RoleService } from './role.service';
import { AuthUserDto } from 'src/dto/others/auth.response.dto';

@Controller('/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/statistics/count')
  async statisticsCount(@Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.roleService.statisticsCount(user);
  }

  @Post('/')
  async createRole(@Body() roleDto: RoleDto, @Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.roleService.createRole(roleDto, user);
  }

  @Get('/')
  async findAll(
    @Query() data: ListRolesRequestDto,
    @Req() request: any,
  ): Promise<ResultResponseDto> {
    return await this.roleService.findAll(data, request.user);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.roleService.findOne(id);
  }

  @Delete('/:id')
  async deleteRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Req() request: any,
  ) {
    const user: AuthUserDto = request?.user;
    return await this.roleService.deleteRole(roleId, user);
  }

  @Patch('/update')
  async updateRole(@Body() updateRoleDto: UpdateRoleDto, @Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.roleService.updateRole(updateRoleDto, user);
  }
}
