import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {WsException} from "@nestjs/websockets";
import {FastifyRequest} from "fastify";
import {JwtService} from "../../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {Players, Rooms} from "@prisma/client";

@Injectable()
export class WsAuthGuard implements CanActivate{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async authenticate(handshake: any): Promise<boolean>{
        const token: string = this.extractTokenFromHeader(handshake);
        if(!token){
            throw new WsException("Session id not found in headers");
        }
        const decodedToken = this.jwtService.verifyJWT(token, this.configService.get<string>("JWT_SECRET"));
        const roomCode: string = decodedToken.roomCode;
        const playerName: string = decodedToken.playerName;
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                code: roomCode,
            },
        });
        if(!room)
            throw new WsException("Room not found");
        const player: Players = await this.prismaService.players.findFirst({
            where: {
                name: playerName,
                room_code: roomCode,
            },
        });
        if(!player)
            throw new WsException("Player not found");
        handshake.roomCode = roomCode;
        handshake.playerName = playerName;
        return true;
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request: any = context.switchToHttp().getRequest();
        return await this.authenticate(request.handshake);
    }
}
