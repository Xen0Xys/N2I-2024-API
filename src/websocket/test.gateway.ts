import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit, SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import {Logger} from "@nestjs/common";
import {Server} from "socket.io";
import {AsyncApiPub, AsyncApiSub} from "nestjs-asyncapi";
import {VersionEntity} from "../common/models/entities/version.entity";

@WebSocketGateway()
export class TestGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
    private readonly logger = new Logger(TestGateway.name);

    @WebSocketServer() socket: Server;

    afterInit(){
        this.logger.log("Test gateway initialized");
    }

    handleDisconnect(client: any){
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: any){
        this.logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage("ping")
    @AsyncApiPub({
        channel: "ping",
        message: {
            payload: VersionEntity,
        },
    })
    @AsyncApiSub({
        channel: "pong",
        message: {
            payload: VersionEntity,
        },
    })
    handlePing(client: any, payload: any){
        this.logger.log(`Received ping from ${client.id}`);
        return {
            event: "pong",
            data: payload,
        };
    }
}
