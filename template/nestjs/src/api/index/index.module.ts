import { Module } from '@nestjs/common';
import { HelloController } from './index.controller';
import { IndexService } from './index.service';
import * as MODELS from '../../model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(MODELS)])],
  controllers: [HelloController],
  providers: [IndexService],
})
export class IndexModule {}
