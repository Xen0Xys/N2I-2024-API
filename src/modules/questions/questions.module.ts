import {Module} from "@nestjs/common";
import {QuestionsService} from "./questions.service";
import {ServicesModule} from "../../common/services/services.module";

@Module({
    exports: [QuestionsService],
    imports: [ServicesModule],
    providers: [QuestionsService],
    controllers: [],
})
export class QuestionsModule{}
