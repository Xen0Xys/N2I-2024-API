import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {RoomsService} from "./rooms.service";
import {RoomsController} from "./rooms.controller";
import {RoomsGateway} from "./rooms.gateway";
import {WsAuthGuard} from "./guards/ws-auth.guard";

@Module({
    controllers: [RoomsController],
    providers: [RoomsService, RoomsGateway, WsAuthGuard],
    imports: [ServicesModule],
    exports: [],
})
export class RoomsModule{}
