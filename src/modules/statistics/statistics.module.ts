import {Module} from "@nestjs/common";
import {StatisticsController} from "./statistics.controller";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    exports: [],
    imports: [ServicesModule],
    providers: [],
    controllers: [StatisticsController],
})
export class StatisticsModule{}
