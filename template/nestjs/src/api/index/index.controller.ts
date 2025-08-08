import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Quote } from './index.interface';
import { IndexService } from './index.service';
import { NoAuth, Public } from '../../decorators/public.decorator';

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
}
