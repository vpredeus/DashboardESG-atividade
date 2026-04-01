import { PrismaService } from "../prisma/prisma.service";
type ProjetoInput = {
    postado?: string | null;
    tipo?: string | null;
    empresa?: string | null;
    responsavel?: string | null;
    email?: string | null;
    titulo?: string | null;
    descricaoDesafio?: string | null;
    descricao?: string | null;
    areaPrimaria?: string | null;
    areaSecundaria?: string | null;
    resumo?: string | null;
    ods1?: string | number | null;
    ods2?: string | number | null;
    ods3?: string | number | null;
    impactoSocialDireto?: number | null;
    impactoSocialIndireto?: number | null;
    eixo?: string | null;
    natureza?: string | null;
};
export declare class AppService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDados(): Promise<object[]>;
    salvarDados(dados: ProjetoInput[]): Promise<{
        count: number;
    }>;
    apagarTodosDados(): Promise<{
        count: number;
    }>;
}
export {};
