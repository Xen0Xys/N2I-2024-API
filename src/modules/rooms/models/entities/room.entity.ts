import {QuestionDifficulty} from "@prisma/client";

export class RoomEntity{
    code: string;
    name: string;
    difficulty: QuestionDifficulty;
    questionCount: number;
    maxPlayers: number;
    started: boolean;
}
