import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../shared/database';
import {
  ConflictException,
  NotFoundException,
} from '../../../shared/errors';
import { CreateUserBranchAssignmentDto } from './dto/create-user-branch-assignment.dto';

@Injectable()
export class UserBranchService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: CreateUserBranchAssignmentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, deletedAt: null },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const existing = await this.prisma.userBranchAssignment.findUnique({
      where: {
        userId_branchId: {
          userId: dto.userId,
          branchId: dto.branchId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'User is already assigned to this branch',
      );
    }

    return this.prisma.userBranchAssignment.create({
      data: { userId: dto.userId, branchId: dto.branchId },
    });
  }

  async remove(id: string) {
    const assignment = await this.prisma.userBranchAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.userBranchAssignment.delete({
      where: { id },
    });
  }

  async findByBranch(branchId: string) {
    return this.prisma.userBranchAssignment.findMany({
      where: { branchId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.userBranchAssignment.findMany({
      where: { userId },
      include: {
        branch: {
          include: {
            province: {
              include: {
                country: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  async getUserBranchIds(userId: string): Promise<string[]> {
    const assignments = await this.prisma.userBranchAssignment.findMany({
      where: { userId },
      select: { branchId: true },
    });

    return assignments.map((a) => a.branchId);
  }
}
