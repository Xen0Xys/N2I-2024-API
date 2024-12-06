import {Module} from "@nestjs/common";
import {QuestionsService} from "./questions.service";
import {ServicesModule} from "../../common/services/services.module";
import {QuestionsController} from "./questions.controller";

@Module({
    exports: [QuestionsService],
    imports: [ServicesModule],
    providers: [QuestionsService],
    controllers: [QuestionsController],
})
export class QuestionsModule{}
