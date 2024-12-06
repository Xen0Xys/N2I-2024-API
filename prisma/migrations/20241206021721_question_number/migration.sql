/*
  Warnings:

  - Added the required column `question_number` to the `room_done_questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "room_done_questions" ADD COLUMN     "question_number" INTEGER NOT NULL;
