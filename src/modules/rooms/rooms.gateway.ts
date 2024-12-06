import {OnGatewayConnection, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server} from "socket.io";
import {UseGuards} from "@nestjs/common";
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
export class RoomsGateway implements OnGatewayConnection{
    @WebSocketServer() socket: Server;
    private readonly roomClients: Map<string, string[]> = new Map<string, string[]>();

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
            console.log(this.roomClients);
        }catch(_: any){
            client.disconnect();
            return;
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
