import {Body, Controller, Get, Post, Put, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {RoomsService} from "./rooms.service";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {TokenResponse} from "./models/responses/token.response";
import {JoinRoomDto} from "./models/dto/join-room.dto";
import {AuthGuard} from "./guards/auth.guard";
import {EditRoomDto} from "./models/dto/edit-room.dto";
import {RoomDataResponse} from "./models/responses/room-data.response";

@Controller("rooms")
@ApiTags("Rooms")
export class RoomsController{
    constructor(
        private readonly roomsService: RoomsService,
    ){}

    /**
     * Create a room
     *
     * @throws {400} Invalid room settings
     * @throws {500} Internal server error
     */
    @Post("create")
    async createRoom(@Body() body: CreateRoomDto): Promise<TokenResponse>{
        return await this.roomsService.createRoom(body);
    }

    /**
     * Join a room
     *
     * @throws {400} Invalid room code
     * @throws {404} Room not found
     * @throws {409} Room is full
     * @throws {500} Internal server error
     */
    @Post("join")
    async joinRoom(@Body() body: JoinRoomDto): Promise<TokenResponse>{
        return await this.roomsService.joinRoom(body);
    }

    /**
     * Get the current room
     *
     * @throws {401} Unauthorized
     * @throws {500} Internal server error
     */
    @Get("current")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async getCurrentRoom(@Req() req: any): Promise<RoomDataResponse>{
        return await this.roomsService.getCurrentRoom(req.roomCode);
    }

    /**
     * Update room settings
     *
     * @throws {400} Invalid room settings
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {409} Room is already started
     * @throws {500} Internal server error
     */
    @Put("settings")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async updateRoomSettings(@Req() req: any, @Body() body: EditRoomDto): Promise<void>{
        return await this.roomsService.updateRoomSettings(req.roomCode, req.playerName, body);
    }

    /**
     * Start the game
     *
     * @throws {401} Unauthorized
     * @throws {403} Forbidden
     * @throws {409} Room is already started
     * @throws {500} Internal server error
     */
    @Post("start")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async startGame(@Req() req: any): Promise<void>{
        return await this.roomsService.startRoom(req.roomCode, req.playerName);
    }
}
