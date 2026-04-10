import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard, Roles, RolesGuard } from '../../../shared/auth';
import { UserBranchService } from './user-branch.service';
import { CreateUserBranchAssignmentDto } from './dto/create-user-branch-assignment.dto';

@Controller('v1/admin/branch-management/user-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserBranchController {
  constructor(private readonly userBranchService: UserBranchService) {}

  @Post()
  @Roles('admin-manager')
  @HttpCode(HttpStatus.CREATED)
  async assign(@Body() dto: CreateUserBranchAssignmentDto) {
    return this.userBranchService.assign(dto);
  }

  @Delete(':id')
  @Roles('admin-manager')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.userBranchService.remove(id);
  }

  @Get()
  @Roles('admin-manager', 'admin-operation')
  @HttpCode(HttpStatus.OK)
  async find(
    @Query('branchId') branchId?: string,
    @Query('userId') userId?: string,
  ) {
    if (branchId) {
      return this.userBranchService.findByBranch(branchId);
    }
    if (userId) {
      return this.userBranchService.findByUser(userId);
    }
    return [];
  }
}
