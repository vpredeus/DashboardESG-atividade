import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
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

function parsePostado(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;

  const br = raw.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (br) {
    const iso = `${br[3]}-${br[2]}-${br[1]}T${br[4]}:${br[5]}:${br[6]}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normText(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function desafioKey(item: {
  empresa: string | null;
  titulo_desafio: string | null;
  descricao_desafio: string | null;
  postado: Date | null;
}): string {
  return [
    normText(item.empresa),
    normText(item.titulo_desafio),
    normText(item.descricao_desafio),
    item.postado ? item.postado.toISOString() : "",
  ].join("|");
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private prisma: PrismaService) {}

  async getDados(): Promise<object[]> {
    try {
      return await this.prisma.desafios.findMany();
    } catch (error) {
      this.logger.error("Erro ao buscar desafios no banco:", error);
      throw new InternalServerErrorException(
        "Não foi possível recuperar os dados do banco.",
      );
    }
  }

  async salvarDados(dados: ProjetoInput[]): Promise<{ count: number }> {
    try {
      // Mapeia camelCase (frontend) → snake_case (banco)
      const mapped = dados.map((p: ProjetoInput) => ({
        postado: parsePostado(p.postado),
        tipo: p.tipo ?? null,
        empresa: p.empresa ?? null,
        responsavel: p.responsavel ?? null,
        email: p.email ?? null,
        titulo_desafio: p.titulo ?? null,
        descricao_desafio: p.descricaoDesafio ?? null,
        descricao: p.descricao ?? null,
        area_primaria: p.areaPrimaria ?? null,
        area_secundaria: p.areaSecundaria ?? null,
        resumo: p.resumo ?? null,
        ods_1: p.ods1 ? Number.parseInt(String(p.ods1), 10) : null,
        ods_2: p.ods2 ? Number.parseInt(String(p.ods2), 10) : null,
        ods_3: p.ods3 ? Number.parseInt(String(p.ods3), 10) : null,
        impacto_social_direto_num: p.impactoSocialDireto ?? null,
        impacto_social_indireto_num: p.impactoSocialIndireto ?? null,
        eixo: p.eixo ?? null,
        natureza: p.natureza ?? null,
      }));

      const existentes = await this.prisma.desafios.findMany({
        select: {
          empresa: true,
          titulo_desafio: true,
          descricao_desafio: true,
          postado: true,
        },
      });

      const chaveExistente = new Set(existentes.map((d) => desafioKey(d)));
      const chaveLote = new Set<string>();

      const novos = mapped.filter((item) => {
        const key = desafioKey(item);
        if (chaveExistente.has(key) || chaveLote.has(key)) {
          return false;
        }
        chaveLote.add(key);
        return true;
      });

      if (!novos.length) {
        this.logger.log("ℹ️ Nenhum novo desafio para inserir (todos duplicados).");
        return { count: 0 };
      }

      const result = await this.prisma.desafios.createMany({
        data: novos,
        skipDuplicates: true,
      });

      this.logger.log(`✅ ${result.count} registros salvos no banco.`);
      return { count: result.count };
    } catch (error) {
      this.logger.error("Erro ao salvar dados no banco:", error);
      throw new InternalServerErrorException(
        "Falha ao salvar os dados no banco.",
      );
    }
  }

  async apagarTodosDados(): Promise<{ count: number }> {
    try {
      const result = await this.prisma.desafios.deleteMany();
      this.logger.log(`🗑️ ${result.count} registros removidos do banco.`);
      return { count: result.count };
    } catch (error) {
      this.logger.error("Erro ao apagar dados do banco:", error);
      throw new InternalServerErrorException(
        "Falha ao apagar os dados do banco.",
      );
    }
  }
}
