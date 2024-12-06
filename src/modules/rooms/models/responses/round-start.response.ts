import {IQuestion} from "../../../questions/models/entities/questions.entities";
import {CountdownModel} from "../models/countdown.model";

export class RoundStartResponse extends CountdownModel{
    question: IQuestion;
}
