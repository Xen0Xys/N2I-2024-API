import {Module} from "@nestjs/common";
import {ServicesModule} from "../../common/services/services.module";
import {RoomsService} from "./rooms.service";
import {RoomsController} from "./rooms.controller";

@Module({
    controllers: [RoomsController],
    providers: [RoomsService],
    imports: [ServicesModule],
    exports: [],
})
export class RoomsModule{}
