import { AppService } from "./app.service";
export declare class AppController {
    private appService;
    constructor(appService: AppService);
    getDados(): Promise<object[]>;
    salvarDados(dados: object[]): Promise<{
        message: string;
        count: number;
    }>;
    apagarDados(): Promise<{
        message: string;
        count: number;
    }>;
}
