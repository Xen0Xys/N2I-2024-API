import {Body, Controller, Post} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {RoomsService} from "./rooms.service";
import {CreateRoomDto} from "./models/dto/create-room.dto";
import {TokenResponse} from "./models/responses/token.response";
import {JoinRoomDto} from "./models/dto/join-room.dto";

@Controller("rooms")
@ApiTags("Rooms")
export class RoomsController{
    constructor(
        private readonly roomsService: RoomsService,
    ){}

    /**
     * Create a room
     *
     * @throws {500} Internal server error
     */
    @Post("create")
    async createRoom(@Body() body: CreateRoomDto): Promise<TokenResponse>{
        return await this.roomsService.createRoom(body);
    }

    /**
     * Join a room
     *
     * @throws {404} Room not found
     * @throws {409} Room is full
     * @throws {500} Internal server error
     */
    @Post("join")
    async joinRoom(@Body() body: JoinRoomDto): Promise<TokenResponse>{
        return await this.roomsService.joinRoom(body);
    }
}
