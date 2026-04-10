import { Module } from '@nestjs/common';

import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { HierarchyController } from './hierarchy.controller';
import { HierarchyService } from './hierarchy.service';
import { ProvinceController } from './province.controller';
import { ProvinceService } from './province.service';
import { UserBranchController } from './user-branch.controller';
import { UserBranchService } from './user-branch.service';

@Module({
  controllers: [
    CountryController,
    ProvinceController,
    BranchController,
    UserBranchController,
    HierarchyController,
  ],
  providers: [
    CountryService,
    ProvinceService,
    BranchService,
    UserBranchService,
    HierarchyService,
  ],
  exports: [BranchService, UserBranchService],
})
export class BranchManagementModule {}
