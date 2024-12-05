import {IsString, Length} from "class-validator";

export class JoinRoomDto{
    @Length(3, 30)
    @IsString()
    playerName: string;

    @Length(6, 6)
    @IsString()
    roomCode: string;
}
