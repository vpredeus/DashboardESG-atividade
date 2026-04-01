import { PrismaService } from "../prisma/prisma.service";
export declare class AppService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDados(): Promise<object[]>;
    salvarDados(dados: object[]): Promise<{
        count: number;
    }>;
}
