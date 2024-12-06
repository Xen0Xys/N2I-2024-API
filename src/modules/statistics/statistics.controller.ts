import {Controller, Get} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {PrismaService} from "../../common/services/prisma.service";
import {StatisticsEntity} from "./models/entities/statistics.entity";
import {EndedRooms} from "@prisma/client";
import {EndedRoomEntity} from "./models/entities/ended-room.entity";

@Controller("statistics")
@ApiTags("Statistics")
export class StatisticsController{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    @Get()
    async getStatistics(): Promise<StatisticsEntity>{
        const endedRooms: EndedRooms[] = await this.prismaService.endedRooms.findMany();
        const statisticsEntity: StatisticsEntity = new StatisticsEntity();
        statisticsEntity.endedRooms = endedRooms.map((endedRoom: EndedRooms): EndedRoomEntity => {
            const scores: number[] = endedRoom.scores;
            const averageScore: number = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
            const lowerScore: number = Math.min(...scores);
            const higherScore: number = Math.max(...scores);
            return {
                id: endedRoom.id,
                playerCount: endedRoom.player_count,
                questionCount: endedRoom.question_count,
                scores,
                createdAt: endedRoom.created_at,
                averageScore,
                lowerScore,
                higherScore,
            } as EndedRoomEntity;
        });
        statisticsEntity.averageScore = statisticsEntity.endedRooms.reduce((a: number, b: EndedRoomEntity) => a + b.averageScore, 0) / statisticsEntity.endedRooms.length;
        statisticsEntity.lowerScore = Math.min(...statisticsEntity.endedRooms.map((endedRoom: EndedRoomEntity) => endedRoom.lowerScore));
        statisticsEntity.higherScore = Math.max(...statisticsEntity.endedRooms.map((endedRoom: EndedRoomEntity) => endedRoom.higherScore));
        statisticsEntity.playedRooms = endedRooms.length;
        return statisticsEntity;
    }
}
