import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from "@nestjs/websockets";
import {Server} from "socket.io";
import {Logger, UseGuards} from "@nestjs/common";
import {WsAuthGuard} from "./guards/ws-auth.guard";
import {PrismaService} from "../../common/services/prisma.service";
import {AsyncApiPub} from "nestjs-asyncapi";
import {RoomDataResponse} from "./models/responses/room-data.response";
import {CountdownModel} from "./models/models/countdown.model";
import {RoundStartResponse} from "./models/responses/round-start.response";
import {RoundSummaryResponse} from "./models/responses/round-summary.response";

@WebSocketGateway({
    namespace: "rooms",
    cors: {
        origin: "*",
    },
})
@UseGuards(WsAuthGuard)
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect{
    private readonly logger: Logger = new Logger(RoomsGateway.name);
    @WebSocketServer() socket: Server;
    private readonly roomClients: Map<string, any[]> = new Map<string, any[]>();

    constructor(
        private readonly authGuardService: WsAuthGuard,
        private readonly prismaService: PrismaService,
    ){}

    async handleConnection(client: any){
        try{
            await this.authGuardService.authenticate(client.handshake);
            if(!this.roomClients.has(client.handshake.roomCode))
                this.roomClients.set(client.handshake.roomCode, [client]);
            else
                this.roomClients.get(client.handshake.roomCode).push(client);
            this.logger.log(`Client ${client.handshake.playerName} connected to room ${client.handshake.roomCode}`);
        }catch(_: any){
            client.disconnect();
            return;
        }
    }

    async handleDisconnect(client: any){
        if(this.roomClients.has(client.handshake.roomCode)){
            const index: number = this.roomClients.get(client.handshake.roomCode).indexOf(client);
            if(index !== -1)
                this.roomClients.get(client.handshake.roomCode).splice(index, 1);
            if(this.roomClients.get(client.handshake.roomCode).length === 0)
                this.roomClients.delete(client.handshake.roomCode);
            this.logger.log(`Client ${client.handshake.playerName} disconnected from room ${client.handshake.roomCode}`);
        }
    }

    @AsyncApiPub({
        channel: "update",
        message: {
            payload: RoomDataResponse,
        },
    })
    onRoomUpdate(response: RoomDataResponse): void{
        if(!this.roomClients.has(response.room.code))
            throw new WsException("No clients in room");
        this.roomClients.get(response.room.code).forEach((client: any) => client.emit("update", response));
        this.logger.log(`Update emitted for room ${response.room.code}`);
    }

    @AsyncApiPub({
        channel: "onGameStart",
        message: {
            payload: CountdownModel,
        },
    })
    onGameStart(roomCode: string, response: CountdownModel): void{
        if(!this.roomClients.has(roomCode))
            throw new WsException("No clients in room");
        this.roomClients.get(roomCode).forEach((client: any) => client.emit("onGameStart", response));
        this.logger.log(`Game start emitted for room ${roomCode}`);
    }

    @AsyncApiPub({
        channel: "onRoundStart",
        message: {
            payload: RoundStartResponse,
        },
    })
    onRoundStart(roomCode: string, response: RoundStartResponse): void{
        if(!this.roomClients.has(roomCode))
            throw new WsException("No clients in room");
        this.roomClients.get(roomCode).forEach((client: any) => client.emit("onRoundStart", response));
        this.logger.log(`Round start emitted for room ${roomCode}`);
    }

    @AsyncApiPub({
        channel: "onRoundSummary",
        message: {
            payload: RoundSummaryResponse,
        },
    })
    onRoundSummary(roomCode: string, response: RoundSummaryResponse): void{
        if(!this.roomClients.has(roomCode))
            throw new WsException("No clients in room");
        this.roomClients.get(roomCode).forEach((client: any) => client.emit("onRoundSummary", response));
        this.logger.log(`Round end emitted for room ${roomCode}`);
    }

    @AsyncApiPub({
        channel: "onRoomEnd",
        message: {
            payload: RoomDataResponse,
        },
    })
    onRoomEnd(roomCode: string, response: RoomDataResponse): void{
        if(!this.roomClients.has(roomCode))
            throw new WsException("No clients in room");
        this.roomClients.get(roomCode).forEach((client: any) => client.emit("onRoomEnd", response));
        this.logger.log(`Room end emitted for room ${roomCode}`);
    }
}
