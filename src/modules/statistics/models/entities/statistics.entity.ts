import {EndedRoomEntity} from "./ended-room.entity";

export class StatisticsEntity{
    endedRooms: EndedRoomEntity[];
    averageScore: number;
    lowerScore: number;
    higherScore: number;
    playedRooms: number;
}
