-- CreateEnum
CREATE TYPE "QuestionTypes" AS ENUM ('IMAGE', 'VIDEO', 'TEXT', 'NEAREST', 'FILL');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'DEVIL', 'CYBER');

-- CreateTable
CREATE TABLE "ended_rooms" (
    "id" SERIAL NOT NULL,
    "player_count" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,
    "scores" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ended_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "room_code" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "question_count" INTEGER NOT NULL,
    "max_player_count" INTEGER NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "room_done_questions" (
    "room_code" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "room_done_questions_pkey" PRIMARY KEY ("room_code","question_id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "version" SMALLINT NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "type" "QuestionTypes" NOT NULL,
    "question" TEXT NOT NULL,
    "src" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_questions" (
    "question_id" INTEGER NOT NULL,
    "candidates" TEXT[],
    "answers" INTEGER[]
);

-- CreateTable
CREATE TABLE "nearest_questions" (
    "question_id" INTEGER NOT NULL,
    "answer" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "fill_questions" (
    "question_id" INTEGER NOT NULL,
    "candidates" TEXT[],
    "answer" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "media_questions_question_id_key" ON "media_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "nearest_questions_question_id_key" ON "nearest_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "fill_questions_question_id_key" ON "fill_questions"("question_id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "rooms"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_done_questions" ADD CONSTRAINT "room_done_questions_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "rooms"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_done_questions" ADD CONSTRAINT "room_done_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_questions" ADD CONSTRAINT "media_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearest_questions" ADD CONSTRAINT "nearest_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_questions" ADD CONSTRAINT "fill_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
