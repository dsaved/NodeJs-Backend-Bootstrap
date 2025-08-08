import { Module } from '@nestjs/common';
import { GroupController } from './groups.controller';
import { GroupService } from './groups.service';
import * as MODELS from '../../model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../../app-guards/jwt.user-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(MODELS)])],
  providers: [GroupService, JwtStrategy],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupsModule {}
