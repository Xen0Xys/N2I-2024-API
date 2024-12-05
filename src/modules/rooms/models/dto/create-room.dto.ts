import {QuestionDifficulty} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsInt, IsString, Length, Max, Min} from "class-validator";

export class CreateRoomDto{
    @Length(3, 30)
    @IsString()
    playerName: string;

    @Length(3, 255)
    @IsString()
    roomName: string;

    @Min(1)
    @Max(10)
    @IsInt()
    maxPlayers: number;

    @Min(1)
    @Max(20)
    @IsInt()
    questionCount: number;

    @ApiProperty({enum: QuestionDifficulty})
    @IsString()
    @IsEnum(QuestionDifficulty)
    difficulty: QuestionDifficulty;
}
