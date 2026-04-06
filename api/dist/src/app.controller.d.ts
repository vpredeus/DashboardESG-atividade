import { AppService } from "./app.service";
import { DesafioInput } from "./app.service";
export declare class AppController {
    private appService;
    constructor(appService: AppService);
    getDados(): object;
    criarDesafios(dados: DesafioInput[] | {
        desafios: DesafioInput[];
    }): Promise<object>;
    apagarDados(): Promise<{
        message: string;
        count: number;
    }>;
}
