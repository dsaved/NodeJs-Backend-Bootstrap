import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import * as MODELS from '../../model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../../app-guards/jwt.user-strategy';

@Module({
  imports: [TypeOrmModule.forFeature([...Object.values(MODELS)])],
  providers: [RoleService, JwtStrategy],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RolessModule {}
