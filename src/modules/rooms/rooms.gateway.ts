import {OnGatewayConnection, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server} from "socket.io";
import {UseGuards} from "@nestjs/common";
import {WsAuthGuard} from "./guards/ws-auth.guard";
import {PrismaService} from "../../common/services/prisma.service";
import {AsyncApiPub} from "nestjs-asyncapi";
import {RoomDataResponse} from "./models/responses/room-data.response";

@WebSocketGateway({namespace: "rooms"})
@UseGuards(WsAuthGuard)
export class RoomsGateway implements OnGatewayConnection{
    @WebSocketServer() socket: Server;

    constructor(
        private readonly authGuardService: WsAuthGuard,
        private readonly prismaService: PrismaService,
    ){}

    async handleConnection(client: any){
        try{
            await this.authGuardService.authenticate(client.handshake);
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
        this.socket.emit("update", response);
    }
}
