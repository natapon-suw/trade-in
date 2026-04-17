-- DropIndex: Remove unique constraints that conflict with soft-delete
-- Uniqueness is enforced at the application level (WHERE deletedAt IS NULL)

DROP INDEX `admin_countries_name_key` ON `admin_countries`;

DROP INDEX `admin_provinces_countryId_name_key` ON `admin_provinces`;
CREATE INDEX `admin_provinces_countryId_name_idx` ON `admin_provinces`(`countryId`, `name`);

DROP INDEX `admin_branches_provinceId_name_key` ON `admin_branches`;
CREATE INDEX `admin_branches_provinceId_name_idx` ON `admin_branches`(`provinceId`, `name`);
