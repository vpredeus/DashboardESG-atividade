import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Prisma, desafios as Desafio } from "@prisma/client";

export type DesafioInput = Omit<Prisma.desafiosCreateInput, "postado"> & {
  postado?: string | Date | null;
};

type DesafioIgnorado = {
  desafio: DesafioInput;
  motivo: string;
};

// ── parsePostado: única versão, trata DD/MM/YYYY HH:MM:SS e ISO ──────────────
function parsePostado(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;

  // Formato brasileiro: DD/MM/YYYY HH:MM:SS
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (br) {
    const iso = `${br[3]}-${br[2]}-${br[1]}T${br[4]}:${br[5]}:${br[6]}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // ISO e outros formatos reconhecidos pelo motor JS
  const parsed = new Date(raw.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private prisma: PrismaService) {}

  async getDados() {
    return this.prisma.desafios.findMany();
  }

  async criarDesafios(desafios: DesafioInput[]) {
    const salvos: Desafio[] = [];
    const ignorados: DesafioIgnorado[] = [];

    for (const desafio of desafios) {
      const postadoDate = parsePostado(desafio.postado);

      // ── Camada 1: verifica por postado (campo único no schema) ──────────────
      if (postadoDate) {
        const existePorPostado = await this.prisma.desafios
          .findUnique({ where: { postado: postadoDate } })
          .catch(() => null);

        if (existePorPostado) {
          const ehLinhaIdentica = this.compararCampos(
            existePorPostado,
            desafio,
            postadoDate,
          );
          ignorados.push({
            desafio,
            motivo: ehLinhaIdentica
              ? "Linha completamente idêntica já existe no banco"
              : "Registro com este horário de postagem já existe",
          });
          continue;
        }
      }

      // ── Camada 2: verifica linha completamente idêntica em todos os campos ──
      const duplicataCompleta = await this.encontrarLinhaIdentica(
        desafio,
        postadoDate,
      );
      if (duplicataCompleta) {
        ignorados.push({
          desafio,
          motivo: "Linha completamente idêntica já existe no banco",
        });
        continue;
      }

      // ── Sem duplicata: insere ───────────────────────────────────────────────
      const parseOds = (v: unknown): number | null => {
        if (v === null || v === undefined || v === "") return null;
        const n = Number(v);
        return Number.isFinite(n) ? Math.round(n) : null;
      };

      const data: Prisma.desafiosCreateInput = {
        postado: postadoDate,
        tipo: desafio.tipo ?? null,
        empresa: desafio.empresa ?? null,
        responsavel: desafio.responsavel ?? null,
        email: desafio.email ?? null,
        titulo_desafio: desafio.titulo_desafio ?? null,
        descricao_desafio: desafio.descricao_desafio ?? null,
        descricao: desafio.descricao ?? null,
        area_primaria: desafio.area_primaria ?? null,
        area_secundaria: desafio.area_secundaria ?? null,
        resumo: desafio.resumo ?? null,
        ods_1: parseOds(desafio.ods_1),
        ods_2: parseOds(desafio.ods_2),
        ods_3: parseOds(desafio.ods_3),
        impacto_social_direto_num: desafio.impacto_social_direto_num ?? null,
        impacto_social_indireto_num:
          desafio.impacto_social_indireto_num ?? null,
        eixo: desafio.eixo ?? null,
        natureza: desafio.natureza ?? null,
      };

      try {
        const desafioCreated = await this.prisma.desafios.create({ data });
        salvos.push(desafioCreated);
      } catch (err: unknown) {
        // Captura violação de unique key (race condition entre requests paralelos)
        const isUniqueViolation =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002";

        if (isUniqueViolation) {
          ignorados.push({
            desafio,
            motivo: "Registro inserido por outro processo simultaneamente",
          });
        } else {
          throw err;
        }
      }
    }

    return {
      salvos: salvos.length,
      ignorados: ignorados.length,
      detalhes: { salvos, ignorados },
    };
  }

  private async encontrarLinhaIdentica(
    desafio: DesafioInput,
    postadoDate: Date | null,
  ): Promise<Desafio | null> {
    const norm = (v: unknown) =>
      v === undefined || v === null || v === "" ? null : v;

    const where: Prisma.desafiosWhereInput = {
      postado: postadoDate ?? null,
      tipo: norm(desafio.tipo) as string | null,
      empresa: norm(desafio.empresa) as string | null,
      responsavel: norm(desafio.responsavel) as string | null,
      email: norm(desafio.email) as string | null,
      titulo_desafio: norm(desafio.titulo_desafio) as string | null,
      descricao_desafio: norm(desafio.descricao_desafio) as string | null,
      descricao: norm(desafio.descricao) as string | null,
      area_primaria: norm(desafio.area_primaria) as string | null,
      area_secundaria: norm(desafio.area_secundaria) as string | null,
      resumo: norm(desafio.resumo) as string | null,
      ods_1: norm(desafio.ods_1) as number | null,
      ods_2: norm(desafio.ods_2) as number | null,
      ods_3: norm(desafio.ods_3) as number | null,
      impacto_social_direto_num: norm(desafio.impacto_social_direto_num) as
        | number
        | null,
      impacto_social_indireto_num: norm(desafio.impacto_social_indireto_num) as
        | number
        | null,
      eixo: norm(desafio.eixo) as string | null,
      natureza: norm(desafio.natureza) as string | null,
    };

    return this.prisma.desafios.findFirst({ where }).catch(() => null);
  }

  private compararCampos(
    salvo: Desafio,
    input: DesafioInput,
    postadoDate: Date | null,
  ): boolean {
    const norm = (v: unknown) =>
      v == null || v === "" ? null : String(v).trim();
    const normDate = (d: Date | null) => d?.toISOString() ?? null;

    return (
      normDate(salvo.postado) === normDate(postadoDate) &&
      norm(salvo.tipo) === norm(input.tipo) &&
      norm(salvo.empresa) === norm(input.empresa) &&
      norm(salvo.responsavel) === norm(input.responsavel) &&
      norm(salvo.email) === norm(input.email) &&
      norm(salvo.titulo_desafio) === norm(input.titulo_desafio) &&
      norm(salvo.descricao_desafio) === norm(input.descricao_desafio) &&
      norm(salvo.descricao) === norm(input.descricao) &&
      norm(salvo.area_primaria) === norm(input.area_primaria) &&
      norm(salvo.area_secundaria) === norm(input.area_secundaria) &&
      norm(salvo.resumo) === norm(input.resumo) &&
      norm(salvo.ods_1) === norm(input.ods_1) &&
      norm(salvo.ods_2) === norm(input.ods_2) &&
      norm(salvo.ods_3) === norm(input.ods_3) &&
      norm(salvo.impacto_social_direto_num) ===
        norm(input.impacto_social_direto_num) &&
      norm(salvo.impacto_social_indireto_num) ===
        norm(input.impacto_social_indireto_num) &&
      norm(salvo.eixo) === norm(input.eixo) &&
      norm(salvo.natureza) === norm(input.natureza)
    );
  }

  async apagarTodosDados(): Promise<{ count: number }> {
    try {
      const result = await this.prisma.desafios.deleteMany();
      Logger.log(`🗑️ ${result.count} registros removidos do banco.`);
      return { count: result.count };
    } catch (error) {
      Logger.error("Erro ao apagar dados do banco:", error);
      throw new InternalServerErrorException(
        "Falha ao apagar os dados do banco.",
      );
    }
  }
}
