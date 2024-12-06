import {PlayerEntity} from "../entities/player.entity";
import {RoomEntity} from "../entities/room.entity";

export class RoomDataResponse{
    room: RoomEntity;
    players: PlayerEntity[];

    constructor(partial: Partial<RoomDataResponse>){
        Object.assign(this, partial);
    }
}
