import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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

  async salvarDados(dados: object[]): Promise<{ count: number }> {
    try {
      // Mapeia camelCase (frontend) → snake_case (banco)
      const mapped = dados.map((p: any) => ({
        postado: p.postado ? new Date(p.postado.replace(" ", "T")) : null,
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
        ods_1: p.ods1 ? parseInt(p.ods1, 10) : null,
        ods_2: p.ods2 ? parseInt(p.ods2, 10) : null,
        ods_3: p.ods3 ? parseInt(p.ods3, 10) : null,
        impacto_social_direto_num: p.impactoSocialDireto ?? null,
        impacto_social_indireto_num: p.impactoSocialIndireto ?? null,
        eixo: p.eixo ?? null,
        natureza: p.natureza ?? null,
      }));

      await this.prisma.desafios.deleteMany();
      const result = await this.prisma.desafios.createMany({
        data: mapped,
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
}
