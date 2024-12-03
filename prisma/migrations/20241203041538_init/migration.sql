/*
  Warnings:

  - You are about to alter the column `fecha_hora` on the `reservas` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `monto_pago` to the `Pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Pedidos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pago` ADD COLUMN `monto_pago` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `total` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `reservas` MODIFY `fecha_hora` TIMESTAMP NOT NULL;
