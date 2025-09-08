-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_brandId_fkey`;

-- AlterTable
ALTER TABLE `products` MODIFY `brandId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
