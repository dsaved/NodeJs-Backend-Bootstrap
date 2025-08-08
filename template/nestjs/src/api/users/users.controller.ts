import {
  Controller,
  Get,
  Query,
  Req,
  Post,
  Body,
  Param,
  NotAcceptableException,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResultResponseDto } from '../../dto/response/base-response-dto';
import {
  CreateUserByAdminRequestDto,
  ListUsersRequestDto,
  UpdatePasswordDto,
  UpdateStatusDto,
  UpdateUserByAdminRequestDto,
} from '../../dto/request/user-request.dto';
import { UserAuthResponseDto } from '../../dto/response/auth.response.dto';
import { UserResponseDto } from '../../dto/response/user-response.dto';
import { AuthUserDto } from '../../dto/others/auth.response.dto';

@Controller({ path: '/users' })
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/statistics/count')
  async statisticsCount(@Req() request: any) {
    const user: AuthUserDto = request?.user;
    return await this.userService.statisticsCount(user);
  }

  @Get()
  async findAll(
    @Query() data: ListUsersRequestDto,
    @Req() request: any,
  ): Promise<ResultResponseDto> {
    return await this.userService.findAll(data, request.user);
  }

  @Get('/profile')
  async myProfileDetails(@Req() request: any): Promise<UserResponseDto> {
    const user: UserAuthResponseDto = request?.user;
    return await this.userService.findOne(user.emailAddress);
  }

  @Patch('/profile/update-password')
  async updatePassword(@Body() data: UpdatePasswordDto) {
    return await this.userService.updatePassword(data);
  }

  @Get('/reset-password/:id')
  async resetAccountPassword(@Param('id') userId: number) {
    if (!userId) throw new NotAcceptableException('user id is required');
    return await this.userService.resetAccountPassword({ userId });
  }

  @Get('/:id')
  async single(@Param('id') id: number): Promise<UserResponseDto> {
    if (!id) throw new NotAcceptableException('id is required');
    return await this.userService.single(id);
  }

  @Post('/')
  async createUser(
    @Body() data: CreateUserByAdminRequestDto,
    @Req() request: any,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(data, request.user);
  }

  @Patch('/status')
  async updateStatus(@Body() dto: UpdateStatusDto, @Req() request: any) {
    return await this.userService.updateStatus(dto, request.user);
  }

  @Patch('/')
  async updateUser(
    @Body() data: UpdateUserByAdminRequestDto,
    @Req() request: any,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(data, request.user);
  }
}
