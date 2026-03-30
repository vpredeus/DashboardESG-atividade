import { PrismaService } from '../prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getDados(): Promise<{
        id: number;
        postado: Date | null;
        tipo: string | null;
        empresa: string | null;
        responsavel: string | null;
        email: string | null;
        titulo_desafio: string | null;
        descricao_desafio: string | null;
        descricao: string | null;
        area_primaria: string | null;
        area_secundaria: string | null;
        resumo: string | null;
        ods_1: number | null;
        ods_2: number | null;
        ods_3: number | null;
        impacto_social_direto_num: number | null;
        impacto_social_indireto_num: number | null;
        eixo: string | null;
        natureza: string | null;
    }[]>;
}
