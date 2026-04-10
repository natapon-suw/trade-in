-- CreateTable
CREATE TABLE `admin_countries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `admin_countries_name_key`(`name`),
    INDEX `admin_countries_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_provinces` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `countryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `admin_provinces_countryId_name_key`(`countryId`, `name`),
    INDEX `admin_provinces_countryId_idx`(`countryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_branches` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `provinceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `admin_branches_provinceId_name_key`(`provinceId`, `name`),
    INDEX `admin_branches_provinceId_idx`(`provinceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_user_branch_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_user_branch_assignments_userId_branchId_key`(`userId`, `branchId`),
    INDEX `admin_user_branch_assignments_userId_idx`(`userId`),
    INDEX `admin_user_branch_assignments_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: Add branchId to assessments
ALTER TABLE `admin_assessments` ADD COLUMN `branchId` VARCHAR(191) NULL;
CREATE INDEX `admin_assessments_branchId_idx` ON `admin_assessments`(`branchId`);

-- AlterTable: Add branchId to stock items
ALTER TABLE `admin_stock_items` ADD COLUMN `branchId` VARCHAR(191) NULL;
CREATE INDEX `admin_stock_items_branchId_idx` ON `admin_stock_items`(`branchId`);

-- AddForeignKey
ALTER TABLE `admin_provinces` ADD CONSTRAINT `admin_provinces_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `admin_countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_branches` ADD CONSTRAINT `admin_branches_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `admin_provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_user_branch_assignments` ADD CONSTRAINT `admin_user_branch_assignments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_user_branch_assignments` ADD CONSTRAINT `admin_user_branch_assignments_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `admin_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_assessments` ADD CONSTRAINT `admin_assessments_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `admin_branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_stock_items` ADD CONSTRAINT `admin_stock_items_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `admin_branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
