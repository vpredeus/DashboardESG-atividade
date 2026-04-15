import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // ajuste o caminho se necessário
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

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

  // findById(id: number) {
  //   return this.prisma.usuarios.findUnique({
  //     where: { id },
  //     select: {
  //       id: true,
  //       nome: true,
  //       sobrenome: true,
  //       email: true,
  //       role: true,
  //     },
  //   });
  // }

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

  // ── Adicionar ao UsersService existente ───────────────────────────────────────

  async findById(id: number) {
    return this.prisma.usuarios.findUnique({ where: { id } });
  }
  // 2. updateUser — PUT /users/me
  // Funciona com o schema atual (nome, sobrenome, email existem)
  async updateUser(
    id: number,
    data: Partial<{
      nome: string;
      sobrenome: string;
      email: string;
    }>,
  ) {
    // Remove campos undefined para não sobrescrever com null
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    );

    const updated = await this.prisma.usuarios.update({
      where: { id },
      data: cleanData,
    });

    const { senha, ...safe } = updated;
    return safe;
  }

  // 3. updatePassword — PATCH /users/me/password
  async updatePassword(id: number, senhaAtual: string, novaSenha: string) {
    const user = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException("Usuário não encontrado");

    // Verifica senha atual
    const [salt, storedHash] = user.senha.split(".");
    const hash = (await scrypt(senhaAtual, salt, 32)) as Buffer;
    if (storedHash !== hash.toString("hex")) {
      throw new UnauthorizedException("Senha atual incorreta");
    }

    // Gera novo hash
    const newSalt = randomBytes(8).toString("hex");
    const newHash = (await scrypt(novaSenha, newSalt, 32)) as Buffer;
    const senhaHash = `${newSalt}.${newHash.toString("hex")}`;

    await this.prisma.usuarios.update({
      where: { id },
      data: { senha: senhaHash },
    });

    return { message: "Senha atualizada com sucesso" };
  }

  // 4. updatePreferences — PATCH /users/me/preferences
  // ⚠️  Requer coluna `preferencias Json?` no model usuarios.
  // Se não existir, o UsersController já faz fallback seguro.
  // async updatePreferences(id: number, prefs: Record<string, boolean>) {
  //   const user = await this.prisma.usuarios.findUnique({ where: { id } });
  //   const atual = (user?.preferencias as Record<string, boolean>) ?? {};
  //   const merged = { ...atual, ...prefs };

  //   await this.prisma.usuarios.update({
  //     where: { id },
  //     data: { preferencias: merged } as any, // `as any` até o schema ser migrado
  //   });

  //   return { preferencias: merged };
  // }

  // 5. getActivity — GET /users/me/activity
  // ⚠️  Requer model `atividade_usuario` no schema Prisma.
  // Se não existir, o UsersController já faz fallback seguro (retorna []).
  async getActivity(userId: number, limit = 20) {
    return (this.prisma as any).atividade_usuario
      ? (this.prisma as any).atividade_usuario.findMany({
          where: { usuario_id: userId },
          orderBy: { criado_em: "desc" },
          take: limit,
        })
      : [];
  }
}
