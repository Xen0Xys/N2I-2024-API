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
import {CountdownModel} from "./models/models/countdown.model";
import {QuestionsService} from "../questions/questions.service";
import {IQuestion} from "../questions/models/entities/questions.entities";
import {RoundStartResponse} from "./models/responses/round-start.response";
import {PlayerEntity} from "./models/entities/player.entity";
import {RoomEntity} from "./models/entities/room.entity";
import {RoundSummaryResponse} from "./models/responses/round-summary.response";

@Injectable()
export class RoomsService{
    private readonly games: Promise<void>[] = [];

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roomsGatewayService: RoomsGateway,
        private readonly questionsService: QuestionsService,
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
        this.roomsGatewayService.onRoomUpdate(await this.getCurrentRoom(room.code));
        return new TokenResponse({token});
    }

    async getCurrentRoom(roomCode: string): Promise<RoomDataResponse>{
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
            } as RoomEntity,
            players: players.map((player: any): PlayerEntity => ({
                name: player.name,
                owner: player.owner,
                score: player.score,
                roomCode: player.room_code,
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
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                code: roomCode,
            },
        });
        if(room.started)
            throw new ConflictException("Room has already started");
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
        this.roomsGatewayService.onRoomUpdate(await this.getCurrentRoom(roomCode));
    }

    async startRoom(roomCode: string, playerName: string): Promise<void>{
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                code: roomCode,
            },
        });
        if(!room)
            throw new NotFoundException("Room not found");
        if(room.started)
            throw new ConflictException("Room has already started");
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
                started: true,
            },
        });
        this.games.push(this.runGame(room));
    }

    private async runGame(room: Rooms): Promise<void>{
        let currentQuestion: number = 0;
        // Start countdown
        const countdown: CountdownModel = {
            endAt: new Date(Date.now() + 5000), // 5 seconds
        } as CountdownModel;
        this.roomsGatewayService.onGameStart(room.code, countdown);
        await this.sleep(5000);
        while(currentQuestion < room.question_count){
            const question: IQuestion = await this.questionsService.pickQuestion(room.code, room.difficulty);
            const baseQuestion: IQuestion = JSON.parse(JSON.stringify(question));
            delete question.specific.answer;
            const roundStartResponse: RoundStartResponse = {
                question,
                endAt: new Date(Date.now() + 30000), // 30 seconds
            } as RoundStartResponse;
            await this.prismaService.roomDoneQuestions.create({
                data: {
                    room_code: room.code,
                    question_id: question.id,
                    question_number: currentQuestion,
                    ended_at: roundStartResponse.endAt,
                },
            });
            this.roomsGatewayService.onRoundStart(room.code, roundStartResponse);
            await this.sleep(30000);
            const roundSummary: RoundSummaryResponse = {
                players: (await this.getCurrentRoom(room.code)).players,
                question: baseQuestion,
                endAt: new Date(Date.now() + 15000), // 15 seconds
            } as RoundSummaryResponse;
            this.roomsGatewayService.onRoundSummary(room.code, roundSummary);
            await this.sleep(15000);
            currentQuestion++;
        }
        const roomData: RoomDataResponse = await this.getCurrentRoom(room.code);
        this.roomsGatewayService.onRoomEnd(room.code, roomData);
        await this.prismaService.endedRooms.create({
            data: {
                player_count: roomData.players.length,
                question_count: room.question_count,
                scores: roomData.players.map((player: PlayerEntity) => player.score),
            },
        });
    }

    private async sleep(ms: number): Promise<void>{
        return new Promise((resolve: any) => setTimeout(resolve, ms));
    }
}
