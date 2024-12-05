import {Module} from "@nestjs/common";
import {TestGateway} from "./test.gateway";

@Module({
    imports: [],
    controllers: [],
    providers: [TestGateway],
    exports: [],
})
export class WebsocketModule{}
