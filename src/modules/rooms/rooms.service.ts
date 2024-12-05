import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Rooms} from "@prisma/client";
import {TokenResponse} from "./models/responses/token.response";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {JwtService} from "../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {JoinRoomDto} from "./models/dto/join-room.dto";

@Injectable()
export class RoomsService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    generateRoomCode(): string{
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async createRoom(createRoomDto: CreateRoomDto): Promise<TokenResponse>{
        const room: Rooms = await this.prismaService.rooms.create({
            data: {
                name: createRoomDto.roomName,
                code: this.generateRoomCode(),
                max_player_count: createRoomDto.maxPlayers,
                difficulty: createRoomDto.difficulty,
                question_count: createRoomDto.questionCount,
                players: {
                    create: {
                        name: createRoomDto.playerName,
                    },
                },
            },
        });
        const token: string = this.jwtService.generateJWT({
            roomCode: room.code,
            playerName: createRoomDto.playerName,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return new TokenResponse({token});
    }

    async joinRoom(body: JoinRoomDto): Promise<TokenResponse>{
        const room: any = await this.prismaService.rooms.findUnique({
            where: {
                code: body.roomCode,
            },
            include: {
                players: true,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        if(room.players.length >= room.max_player_count)
            throw new ConflictException("Room is full");
        const token: string = this.jwtService.generateJWT({
            roomCode: room.code,
            playerName: body.playerName,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        return new TokenResponse({token});
    }
}
