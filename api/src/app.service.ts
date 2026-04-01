import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getDados(){
    return this.prisma.desafios.findMany();
  }

  async criarDesafios(desafios: any[]) {
    const salvos: any[] = [];
    const ignorados: any[] = [];

    for (const desafio of desafios) {
      // Verifica se já existe um desafio com o mesmo campo 'postado'
      if (desafio.postado) {
        const existe = await this.prisma.desafios.findUnique({
          where: { postado: new Date(desafio.postado) },
        }).catch(() => null);

        if (existe) {
          ignorados.push({
            desafio,
            motivo: 'Desafio com este postado já existe',
          });
          continue;
        }
      }

      // Insere o desafio se não existir duplicata
      const desafioCreated = await this.prisma.desafios.create({
        data: {
          ...desafio,
          postado: desafio.postado ? new Date(desafio.postado) : null,
        },
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
}
