import {IsString, Length} from "class-validator";
import {EditRoomDto} from "./edit-room.dto";

export class CreateRoomDto extends EditRoomDto{
    @Length(3, 30)
    @IsString()
    playerName: string;
}
