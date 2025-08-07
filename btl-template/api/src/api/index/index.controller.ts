import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Quote } from './index.interface';
import { IndexService } from './index.service';
import {
  FilePreviewUrlResponseDto,
  FileUploadResponseDto,
  FileUploadUrlResponseDto,
} from '../../dto/response/file-upload-response';
import {
  FileUploadRequestDto,
  FileUploadUrlRequestDto,
} from '../../dto/request/file-upload-request';
import {
  ResultResponseDto,
  RequestResponseDto,
} from '../../dto/response/base-response-dto';
import { BaseRequestDto } from 'src/dto/request/base-request-dto';
import {
  ListLgabyStateRequestDto,
  ListStatebyCountryRequestDto,
  ListStateByZoneRequestDto,
} from '../../dto/request/list-regions-request.dto';
import { classes } from '../../constructs';
import {
  ListPhcsOptionRequestDto,
  ListRolesOptionRequestDto,
  UploadNinRequestDto,
} from '../../dto/request/index-request.dto';
import { NoAuth, Public } from '../../decorators/public.decorator';
import { AuthUserDto } from 'src/dto/others/auth.response.dto';

@Controller({ path: '/' })
export class HelloController {
  constructor(private readonly service: IndexService) {}

  @NoAuth()
  @Public()
  @Get('/')
  index(): Quote {
    return this.service.getIndex();
  }

  @NoAuth()
  @Public()
  @Get('/app-version')
  getVersionNumber(@Res() res) {
    return res.status(HttpStatus.OK).json(this.service.getVersionNumber());
  }

  @NoAuth()
  @Post('/file-upload')
  async uploadFile(
    @Body() data: FileUploadRequestDto,
  ): Promise<FileUploadResponseDto> {
    return this.service.fileUpload(data);
  }

  @NoAuth()
  @Get('/file-upload-url')
  async fileUploadUrl(
    @Query() data: FileUploadUrlRequestDto,
  ): Promise<FileUploadUrlResponseDto> {
    return await this.service.fileUploadUrl(data);
  }

  @NoAuth()
  @Get('/file-preview-url/:id')
  async filePreviewUrl(
    @Param('id') fileId: string,
  ): Promise<FilePreviewUrlResponseDto> {
    return await this.service.filePreviewUrl(+fileId);
  }

  @NoAuth()
  @Get('/list-states')
  async listStates(@Query() data: BaseRequestDto): Promise<ResultResponseDto> {
    return await this.service.listStates(data);
  }

  @NoAuth()
  @Get('/list-country')
  async listCountry(@Query() data: BaseRequestDto): Promise<ResultResponseDto> {
    return await this.service.listCountry(data);
  }
  @NoAuth()
  @Get('/list-lga')
  async listLga(@Query() data: BaseRequestDto): Promise<ResultResponseDto> {
    return await this.service.listLga(data);
  }
  @NoAuth()
  @Get('/list-zone')
  async listZone(@Query() data: BaseRequestDto): Promise<ResultResponseDto> {
    return await this.service.listZone(data);
  }
  @NoAuth()
  @Get('/list-state-by-country')
  async listStatebyCountry(
    @Query() data: ListStatebyCountryRequestDto,
  ): Promise<ResultResponseDto> {
    return await this.service.listStatebyCountry(data);
  }
  @NoAuth()
  @Get('/list-state-by-zone')
  async listStatebyZone(
    @Query() data: ListStateByZoneRequestDto,
  ): Promise<ResultResponseDto> {
    return await this.service.listStatebyZone(data);
  }
  @NoAuth()
  @Get('/list-lga-by-state')
  async listLgabyState(
    @Query() data: ListLgabyStateRequestDto,
  ): Promise<ResultResponseDto> {
    return await this.service.listLgabyState(data);
  }

  @Get('/list-groups')
  async listGroup(
    @Query() data: BaseRequestDto,
    @Req() request: any,
  ): Promise<ResultResponseDto> {
    const user: AuthUserDto = request.user;
    return await this.service.listGroup(data, user);
  }

  @NoAuth()
  @Post('/upload-nin')
  async uploadNin(
    @Body() data: UploadNinRequestDto,
  ): Promise<RequestResponseDto> {
    return await this.service.uploadNin(data);
  }

  @NoAuth()
  @Get('/verify-nin/:nin')
  async verifyNin(@Param('nin') nin: string): Promise<classes.NinObject> {
    if (!nin) throw new BadRequestException('NIN is required');
    return await this.service.verifyNin(nin);
  }

  @Get('/list-actions')
  async listActions(@Req() request: any): Promise<string[]> {
    const user: AuthUserDto = request.user;
    return await this.service.listActions(user);
  }

  @Get('/list-roles')
  async listRoles(
    @Query() data: ListRolesOptionRequestDto,
    @Req() request: any,
  ): Promise<ResultResponseDto> {
    const user: AuthUserDto = request.user;
    return await this.service.listRoles(data, user);
  }

  @NoAuth()
  @Get('/validate-email')
  async validateUserEmail(@Query('email') email: string): Promise<any> {
    return await this.service.validateUserEmail(email);
  }
}
