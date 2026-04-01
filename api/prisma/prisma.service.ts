import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Passa a URL explicitamente — evita falha silenciosa se a variável de ambiente não for carregada
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { emit: "event", level: "error" },
        { emit: "stdout", level: "warn" },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Conexão com o banco de dados estabelecida.");
    } catch (error) {
      this.logger.error("❌ Falha ao conectar ao banco de dados:", error);
      process.exit(1); // encerra se não conseguir conectar
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("🔌 Conexão com o banco encerrada.");
  }
}
