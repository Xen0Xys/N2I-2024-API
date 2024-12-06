import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../../../common/services/prisma.service";
import {FastifyRequest} from "fastify";
import {JwtService} from "../../../common/services/jwt.service";
import {ConfigService} from "@nestjs/config";
import {Players, Rooms} from "@prisma/client";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    async authenticate(request: any): Promise<boolean>{
        const token: string = this.extractTokenFromHeader(request);
        if(!token)
            throw new UnauthorizedException("Session id not found in headers");
        const decodedToken = this.jwtService.verifyJWT(token, this.configService.get<string>("JWT_SECRET"));
        const roomCode: string = decodedToken.roomCode;
        const playerName: string = decodedToken.playerName;
        const room: Rooms = await this.prismaService.rooms.findUnique({
            where: {
                code: roomCode,
            },
        });
        if(!room)
            throw new UnauthorizedException("Room not found");
        const player: Players = await this.prismaService.players.findFirst({
            where: {
                name: playerName,
                room_code: roomCode,
            },
        });
        if(!player)
            throw new UnauthorizedException("Player not found");
        request.roomCode = roomCode;
        request.playerName = playerName;
        return true;
    }

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request: any = context.switchToHttp().getRequest();
        return await this.authenticate(request);
    }
}
