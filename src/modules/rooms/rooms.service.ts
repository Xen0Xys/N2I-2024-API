import {ConflictException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {Players, Rooms} from "@prisma/client";
import {TokenResponse} from "./models/responses/token.response";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {JwtService} from "../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {RoomsGateway} from "./rooms.gateway";
import {RoomDataResponse} from "./models/responses/room-data.response";
import {EditRoomDto} from "./models/dto/edit-room.dto";

@Injectable()
export class RoomsService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roomsGatewayService: RoomsGateway,
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
                        owner: true,
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
        if(room.started)
            throw new ConflictException("Room has already started");
        if(room.players.length >= room.max_player_count)
            throw new ConflictException("Room is full");
        const token: string = this.jwtService.generateJWT({
            roomCode: room.code,
            playerName: body.playerName,
        }, "1d", this.configService.get<string>("JWT_SECRET"));
        await this.prismaService.players.create({
            data: {
                name: body.playerName,
                room_code: room.code,
            },
        });
        await this.roomsGatewayService.onRoomUpdate(await this.getCurrentRoom(room.code));
        return new TokenResponse({token});
    }

    async getCurrentRoom(roomCode: string): Promise<RoomDataResponse>{
        console.log(roomCode);
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                code: roomCode,
            },
        });
        const players: any[] = await this.prismaService.players.findMany({
            where: {
                room_code: roomCode,
            },
        });
        return new RoomDataResponse({
            room: {
                code: room.code,
                name: room.name,
                difficulty: room.difficulty,
                questionCount: room.question_count,
                maxPlayers: room.max_player_count,
                started: room.started,
            },
            players: players.map((player: any) => ({
                name: player.name,
                owner: player.owner,
            })),
        });
    }

    async updateRoomSettings(roomCode: string, playerName: string, body: EditRoomDto){
        const player: Players = await this.prismaService.players.findFirst({
            where: {
                name: playerName,
                room_code: roomCode,
            },
        });
        if(!player.owner)
            throw new ForbiddenException("You are not the room owner");
        await this.prismaService.rooms.update({
            where: {
                code: roomCode,
            },
            data: {
                name: body.roomName,
                max_player_count: body.maxPlayers,
                question_count: body.questionCount,
                difficulty: body.difficulty,
            },
        });
        await this.roomsGatewayService.onRoomUpdate(await this.getCurrentRoom(roomCode));
    }
}
