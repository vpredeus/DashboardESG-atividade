import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
export type DesafioInput = Omit<Prisma.desafiosCreateInput, "postado"> & {
    postado?: string | Date | null;
};
type DesafioIgnorado = {
    desafio: DesafioInput;
    motivo: string;
};
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getDados(): Promise<{
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
        id: number;
    }[]>;
    criarDesafios(desafios: DesafioInput[]): Promise<{
        salvos: number;
        ignorados: number;
        detalhes: {
            salvos: {
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
                id: number;
            }[];
            ignorados: DesafioIgnorado[];
        };
    }>;
    private encontrarLinhaIdentica;
    private compararCampos;
    private parsePostado;
}
export {};
