export class EndedRoomEntity{
    id: number;
    playerCount: number;
    questionCount: number;
    scores: number[];
    createdAt: Date;

    averageScore: number;
    lowerScore: number;
    higherScore: number;
}
