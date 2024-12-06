import {QuestionDifficulty} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsInt, IsString, Length, Max, Min} from "class-validator";

export class EditRoomDto{
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
