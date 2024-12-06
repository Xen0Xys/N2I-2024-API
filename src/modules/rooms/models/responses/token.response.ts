export class TokenResponse{
    token: string;

    constructor(partial: Partial<TokenResponse>){
        Object.assign(this, partial);
    }
}
