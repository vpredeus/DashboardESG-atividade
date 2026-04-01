import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, desafios as Desafio } from "@prisma/client";

export type DesafioInput = Omit<Prisma.desafiosCreateInput, "postado"> & {
  postado?: string | Date | null;
};

type DesafioIgnorado = {
  desafio: DesafioInput;
  motivo: string;
};

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
      const postadoDate = this.parsePostado(desafio.postado);

      // Verifica se já existe um desafio com o mesmo campo 'postado'
      if (postadoDate) {
        const existe = await this.prisma.desafios
          .findUnique({
            where: { postado: postadoDate },
          })
          .catch(() => null);

        if (existe) {
          ignorados.push({
            desafio,
            motivo: "Desafio com este postado já existe",
          });
          continue;
        }
      }

      // Insere o desafio se não existir duplicata
      const data: Prisma.desafiosCreateInput = {
        ...desafio,
        postado: postadoDate,
      };

      const desafioCreated = await this.prisma.desafios.create({
        data,
      });

      salvos.push(desafioCreated);
    }

    return {
      salvos: salvos.length,
      ignorados: ignorados.length,
      detalhes: {
        salvos,
        ignorados,
      },
    };
  }

  private parsePostado(postado: DesafioInput["postado"]): Date | null {
    if (!postado) {
      return null;
    }

    const parsedDate = postado instanceof Date ? postado : new Date(postado);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
}
