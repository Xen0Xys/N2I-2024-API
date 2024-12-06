import {Body, Controller, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {QuestionsService} from "./questions.service";
import {AuthGuard} from "../rooms/guards/auth.guard";
import {SubmitAnswerDto} from "./models/dto/submit-answer.dto";

@Controller("questions")
@ApiTags("Questions")
export class QuestionsController{
    constructor(
        private readonly questionsService: QuestionsService,
    ){}

    /**
     * Submit an answer to the current question.
     *
     * @throws {401} Unauthorized
     * @throws {404} Not Found
     * @throws {500} Internal Server Error
     */
    @Post("submit")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async submitAnswer(@Req() req: any, @Body() body: SubmitAnswerDto): Promise<void>{
        return await this.questionsService.submitAnswer(req.roomCode, req.playerName, body.answer);
    }
}
