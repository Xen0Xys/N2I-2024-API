import {QuestionDifficulty, QuestionTypes} from "@prisma/client";

export class IMediaQuestion{
    src: string;
    candidates: string[];
    answer: number[]; // table of candidates indexes.

    constructor(partial: Partial<IMediaQuestion>){
        Object.assign(this, partial);
    }
}
export class ITextQuestion{
    candidates: string[];
    answer: number[]; // table of candidates indexes.

    constructor(partial: Partial<ITextQuestion>){
        Object.assign(this, partial);
    }
}
export class IBeNearestQuestion{
    src?: string;
    answer: number;

    constructor(partial: Partial<IBeNearestQuestion>){
        Object.assign(this, partial);
    }
}
export class IFillEmptySpacesQuestion{
    src?: string;
    candidates: string[];
    answer: string;

    constructor(partial: Partial<IFillEmptySpacesQuestion>){
        Object.assign(this, partial);
    }
}

export class IQuestion{
    id: number;
    version: number;
    difficulty?: QuestionDifficulty;
    type: QuestionTypes;
    question: string;
    specific: IMediaQuestion | ITextQuestion | IBeNearestQuestion | IFillEmptySpacesQuestion;

    constructor(partial: Partial<IQuestion>){
        Object.assign(this, partial);
    }
}
