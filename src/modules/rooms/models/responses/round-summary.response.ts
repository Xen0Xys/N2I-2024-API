import {CountdownModel} from "../models/countdown.model";
import {PlayerEntity} from "../entities/player.entity";
import {IQuestion} from "../../../questions/models/entities/questions.entities";

export class RoundSummaryResponse extends CountdownModel{
    players: PlayerEntity[];
    question: IQuestion;
}
