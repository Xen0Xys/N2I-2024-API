import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../common/services/prisma.service";
import {QuestionDifficulty, Questions, RoomDoneQuestions} from "@prisma/client";
import {
    IBeNearestQuestion,
    IFillEmptySpacesQuestion,
    IMediaQuestion,
    IQuestion,
    ITextQuestion,
} from "./models/entities/questions.entities";

@Injectable()
export class QuestionsService{
    constructor(private readonly prismaService: PrismaService){}

    private formatQuestion(question: any): void{
        question.difficulty = question.difficulty.toUpperCase();
        question.type = question.type.toUpperCase();
        switch (question.type){
            case "BENEAREST":
                question.type = "NEAREST";
                break;
            case "FILLEMPTYSPACES":
                question.type = "FILL";
                break;
        }
    }

    async upsertQuestion(id: number, question: IQuestion): Promise<void>{
        this.formatQuestion(question);
        switch (question.type){
            case "TEXT":
                await this.upsertTextQuestion(id, question);
                break;
            case "IMAGE":
            case "VIDEO":
                await this.upsertMediaQuestion(id, question);
                break;
            case "NEAREST":
                await this.upsertNearestQuestion(id, question);
                break;
            case "FILL":
                await this.upsertFillQuestion(id, question);
                break;
        }
    }

    private async upsertTextQuestion(id: number, question: IQuestion): Promise<void>{
        const specific = question.specific as ITextQuestion;
        await this.prismaService.questions.upsert({
            where: {id},
            update: {},
            create: {
                id,
                version: question.version,
                difficulty: question.difficulty,
                question: question.question,
                type: question.type,
                media_question: {
                    create: {
                        candidates: specific.candidates,
                        answers: specific.answer,
                    },
                },
            },
        });
    }

    private async upsertMediaQuestion(id: number, question: IQuestion): Promise<void>{
        const specific = question.specific as IMediaQuestion;
        await this.prismaService.questions.upsert({
            where: {id},
            update: {},
            create: {
                id,
                version: question.version,
                difficulty: question.difficulty,
                question: question.question,
                type: question.type,
                src: specific.src,
                media_question: {
                    create: {
                        candidates: specific.candidates,
                        answers: specific.answer,
                    },
                },
            },
        });
    }

    private async upsertNearestQuestion(id: number, question: IQuestion): Promise<void>{
        const specific = question.specific as IBeNearestQuestion;
        await this.prismaService.questions.upsert({
            where: {id},
            update: {},
            create: {
                id,
                version: question.version,
                difficulty: question.difficulty,
                question: question.question,
                type: question.type,
                src: specific.src,
                nearest_question: {
                    create: {answer: specific.answer},
                },
            },
        });
    }

    private async upsertFillQuestion(id: number, question: IQuestion): Promise<void>{
        const specific = question.specific as IFillEmptySpacesQuestion;
        await this.prismaService.questions.upsert({
            where: {id},
            update: {},
            create: {
                id,
                version: question.version,
                difficulty: question.difficulty,
                question: question.question,
                type: question.type,
                src: specific.src,
                fill_question: {
                    create: {
                        candidates: specific.candidates,
                        answer: specific.answer,
                    },
                },
            },
        });
    }

    async pickQuestion(roomCode: string, difficulty: QuestionDifficulty): Promise<IQuestion>{
        const room: any = await this.prismaService.rooms.findUnique({
            where: {code: roomCode},
            include: {
                room_done_questions: true,
            },
        });
        let questions: any[];
        if(difficulty === "ANY")
            questions = await this.prismaService.questions.findMany({
                where: {
                    NOT: {
                        id: {
                            in: room.room_done_questions.map((q: RoomDoneQuestions) => q.question_id),
                        },
                    },
                },
            });
        else
            questions = await this.prismaService.questions.findMany({
                where: {
                    difficulty,
                    NOT: {
                        id: {
                            in: room.room_done_questions.map((q: RoomDoneQuestions) => q.question_id),
                        },
                    },
                },
            });
        if(questions.length === 0)
            return null;
        const question: Questions = questions[Math.floor(Math.random() * questions.length)];
        switch (question.type){
            case "TEXT":
                return await this.fetchTextQuestion(question.id);
            case "IMAGE":
            case "VIDEO":
                return await this.fetchMediaQuestion(question.id);
            case "NEAREST":
                return await this.fetchNearestQuestion(question.id);
            case "FILL":
                return await this.fetchFillQuestion(question.id);
        }
    }

    async fetchTextQuestion(id: number): Promise<IQuestion>{
        const question: any = await this.prismaService.questions.findUnique({
            where: {id},
            include: {
                media_question: true,
            },
        });
        return {
            id: question.id,
            version: question.version,
            difficulty: question.difficulty,
            type: question.type,
            question: question.question,
            specific: {
                candidates: question.media_question.candidates,
                answer: question.media_question.answers,
            } as ITextQuestion,
        } as IQuestion;
    }

    async fetchMediaQuestion(id: number): Promise<IQuestion>{
        const question: any = await this.prismaService.questions.findUnique({
            where: {id},
            include: {
                media_question: true,
            },
        });
        return {
            id: question.id,
            version: question.version,
            difficulty: question.difficulty,
            type: question.type,
            question: question.question,
            specific: {
                src: question.src,
                candidates: question.media_question.candidates,
                answer: question.media_question.answers,
            } as IMediaQuestion,
        } as IQuestion;
    }

    async fetchNearestQuestion(id: number): Promise<IQuestion>{
        const question: any = await this.prismaService.questions.findUnique({
            where: {id},
            include: {
                nearest_question: true,
            },
        });
        return {
            id: question.id,
            version: question.version,
            difficulty: question.difficulty,
            type: question.type,
            question: question.question,
            specific: {
                src: question.src,
                answer: question.nearest_question.answer,
            } as IBeNearestQuestion,
        } as IQuestion;
    }

    async fetchFillQuestion(id: number): Promise<IQuestion>{
        const question: any = await this.prismaService.questions.findUnique({
            where: {id},
            include: {
                fill_question: true,
            },
        });
        return {
            id: question.id,
            version: question.version,
            difficulty: question.difficulty,
            type: question.type,
            question: question.question,
            specific: {
                src: question.src,
                candidates: question.fill_question.candidates,
                answer: question.fill_question.answer,
            } as IFillEmptySpacesQuestion,
        } as IQuestion;
    }

    async submitAnswer(roomCode: string, playerName: string, answer: any){
        const rawQuestion: any = await this.prismaService.roomDoneQuestions.findFirst({
            where: {
                room_code: roomCode,
            },
            orderBy: {
                question_number: "desc",
            },
            include: {
                question: true,
            },
        });
        let score: number;
        switch (rawQuestion.question.type){
            case "TEXT":
                score = this.computeTextAnswer(await this.fetchTextQuestion(rawQuestion.id), answer, rawQuestion.ended_at);
                break;
            case "IMAGE":
            case "VIDEO":
                score = this.computeMediaAnswer(await this.fetchMediaQuestion(rawQuestion.id), answer, rawQuestion.ended_at);
                break;
            case "NEAREST":
                score = this.computeNearestAnswer(await this.fetchNearestQuestion(rawQuestion.id), answer, rawQuestion.ended_at);
                break;
            case "FILL":
                score = this.computeFillAnswer(await this.fetchFillQuestion(rawQuestion.id), answer, rawQuestion.ended_at);
                break;
        }
        await this.prismaService.players.updateMany({
            where: {
                name: playerName,
                room_code: roomCode,
            },
            data: {
                score: {
                    increment: score,
                },
            },
        });
    }

    computeTextAnswer(question: IQuestion, answer: number[], endedAt: Date): number{
        return 0;
    }

    computeMediaAnswer(question: IQuestion, answer: number[], endedAt: Date): number{
        return 0;
    }

    computeNearestAnswer(question: IQuestion, answer: number, endedAt: Date): number{
        return 0;
    }

    computeFillAnswer(question: IQuestion, answer: string, endedAt: Date): number{
        return 0;
    }
}
