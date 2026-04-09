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
      this.logger.log("Conexao com o banco de dados estabelecida.");
    } catch (error) {
      this.logger.error("Falha ao conectar ao banco de dados:", error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Conexao com o banco encerrada.");
  }
}
