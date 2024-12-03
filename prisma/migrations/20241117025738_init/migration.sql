/*
  Warnings:

  - You are about to drop the column `activo` on the `metodo_pago` table. All the data in the column will be lost.
  - You are about to drop the column `cargo_adicional` on the `metodo_pago` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `metodo_pago` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `metodo_pago` table. All the data in the column will be lost.
  - You are about to drop the column `ultima_actualizacion` on the `metodo_pago` table. All the data in the column will be lost.
  - You are about to alter the column `fecha_hora` on the `reservas` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `tipo` to the `Metodo_Pago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `metodo_pago` DROP COLUMN `activo`,
    DROP COLUMN `cargo_adicional`,
    DROP COLUMN `descripcion`,
    DROP COLUMN `fecha_creacion`,
    DROP COLUMN `ultima_actualizacion`,
    ADD COLUMN `tipo` VARCHAR(191) NOT NULL,
    MODIFY `nombre` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `reservas` MODIFY `fecha_hora` TIMESTAMP NOT NULL;
