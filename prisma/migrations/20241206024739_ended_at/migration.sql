/*
  Warnings:

  - Added the required column `ended_at` to the `room_done_questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "room_done_questions" ADD COLUMN     "ended_at" TIMESTAMP(3) NOT NULL;
