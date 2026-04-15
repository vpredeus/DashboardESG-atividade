import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type CreateUserInput = {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  role?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        role: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  findById(id: number) {
    return this.prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        role: true,
      },
    });
  }

  createUser(data: CreateUserInput) {
    // ✅ Sem "select": retorna o objeto completo do Prisma, igual ao findByEmail.
    // Isso garante que o tipo de retorno seja compatível quando reatribuímos
    // `user = await createUser(...)` no auth.service, onde `user` foi
    // inicialmente tipado pelo retorno de `findByEmail`.
    return this.prisma.usuarios.create({
      data: {
        nome: data.nome.trim(),
        sobrenome: data.sobrenome.trim(),
        email: data.email.toLowerCase().trim(),
        senha: data.senha,
        role: data.role ?? "user",
      },
    });
  }
}
