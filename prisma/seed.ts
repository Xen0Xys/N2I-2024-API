import {PrismaClient} from "@prisma/client";
import {QuestionsService} from "../src/modules/questions/questions.service";
import {PrismaService} from "../src/common/services/prisma.service";
import * as fs from "node:fs";
import {IQuestion} from "../src/modules/questions/models/entities/questions.entities";

// initialize Prisma Client
const prisma = new PrismaClient();
const prismaService = new PrismaService();
const questionsService = new QuestionsService(prismaService);

async function main(){
    const gStart = Date.now();

    const questions = JSON.parse(fs.readFileSync("./prisma/questions.json", "utf-8"));

    for(const [id, question] of Object.entries(questions)){
        await questionsService.upsertQuestion(parseInt(id) + 1, question as IQuestion);
    }

    console.log(`\n✅  Seeding completed ! (${Date.now() - gStart}ms)`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
