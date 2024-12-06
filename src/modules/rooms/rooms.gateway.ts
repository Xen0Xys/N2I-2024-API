import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server} from "socket.io";
import {Logger, UseGuards} from "@nestjs/common";
import {WsAuthGuard} from "./guards/ws-auth.guard";
import {PrismaService} from "../../common/services/prisma.service";
import {AsyncApiPub} from "nestjs-asyncapi";
import {RoomDataResponse} from "./models/responses/room-data.response";

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
    async onRoomUpdate(response: RoomDataResponse): Promise<void>{
        this.roomClients.get(response.room.code).forEach((client: any) => client.emit("update", response));
    }
}
