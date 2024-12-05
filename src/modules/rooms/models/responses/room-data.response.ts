import {QuestionDifficulty} from "@prisma/client";

export class RoomDataResponse{
    room: {
        code: string;
        name: string;
        difficulty: QuestionDifficulty;
        questionCount: number;
        maxPlayers: number;
        started: boolean;
    };

    players: {
        name: string;
        owner: boolean;
    }[];

    constructor(partial: Partial<RoomDataResponse>){
        Object.assign(this, partial);
    }
}
