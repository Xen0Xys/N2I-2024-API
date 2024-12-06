import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {ThrottlerModule} from "@nestjs/throttler";
import * as dotenv from "dotenv";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {RoomsModule} from "./modules/rooms/rooms.module";
import {StatisticsModule} from "./modules/statistics/statistics.module";

dotenv.config();

@Module({
    controllers: [AppController],
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 60,
        }]),
        RoomsModule,
        StatisticsModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule{}
