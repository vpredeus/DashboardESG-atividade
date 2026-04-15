/**
 * users.controller.ts — Rotas de perfil do usuário autenticado
 *
 * Rotas:
 *  GET    /users/me                — dados do usuário logado (sem senha)
 *  PUT    /users/me                — atualiza dados pessoais
 *  PATCH  /users/me/password       — troca senha (scrypt no banco)
 *  PATCH  /users/me/preferences    — salva preferências como JSON
 *  GET    /users/me/activity       — histórico de ações
 *
 * ATENÇÃO: Para que PATCH /users/me/password e GET /users/me/activity
 * funcionem completamente, você precisará adicionar campos ao schema Prisma
 * (preferencias Json?, e um model atividade_usuario). Veja o NOVOS_ENDPOINTS_BACKEND.ts.
 * As colunas atuais do banco (id, nome, sobrenome, email, senha, role, criado_em)
 * já são suficientes para GET/PUT /users/me funcionarem.
 */

import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";
import { IsString, IsOptional, MinLength } from "class-validator";

// ── DTOs ──────────────────────────────────────────────────────────────────────

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

class UpdatePasswordDto {
  @IsString()
  @MinLength(1)
  senhaAtual: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}

// ── Controller ────────────────────────────────────────────────────────────────

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Retorna dados do usuário autenticado (sem senha).
   */
  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) throw new BadRequestException("Usuário não encontrado");
    const { senha, ...safe } = user;
    return safe;
  }

  /**
   * PUT /users/me
   * Atualiza nome, sobrenome e/ou e-mail.
   * Apenas as colunas que existem no banco atual (sem session_version, sem preferencias).
   */
  @Put("me")
  @UseGuards(AuthGuard("jwt"))
  async updateMe(@Request() req, @Body() body: UpdateProfileDto) {
    return this.usersService.updateUser(req.user.id, body);
  }

  /**
   * PATCH /users/me/password
   * Verifica senha atual, gera novo hash scrypt e salva.
   */
  @Patch("me/password")
  @UseGuards(AuthGuard("jwt"))
  async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    return this.usersService.updatePassword(
      req.user.id,
      body.senhaAtual,
      body.novaSenha,
    );
  }

  /**
   * PATCH /users/me/preferences
   * Salva preferências como JSON (requer coluna preferencias Json? no schema).
   * Se a coluna não existir, retorna 200 com as prefs recebidas sem persistir.
   */
  // @Patch("me/preferences")
  // @UseGuards(AuthGuard("jwt"))
  // async updatePreferences(
  //   @Request() req,
  //   @Body() body: Record<string, boolean>,
  // ) {
  //   // Tenta salvar; se o método não existir no service, faz fallback seguro
  //   if (typeof this.usersService.updatePreferences === "function") {
  //     return this.usersService.updatePreferences(req.user.id, body);
  //   }
  //   return { preferencias: body };
  // }

  /**
   * GET /users/me/activity
   * Histórico de ações do usuário (requer model atividade_usuario no schema).
   * Retorna array vazio se a tabela não existir.
   */
  @Get("me/activity")
  @UseGuards(AuthGuard("jwt"))
  async getActivity(@Request() req) {
    if (typeof this.usersService.getActivity === "function") {
      return this.usersService.getActivity(req.user.id);
    }
    return [];
  }
}
// import { Controller, Get } from "@nestjs/common";
// import { UsersService } from "./users.service";

// @Controller("users")
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Get()
//   findAll() {
//     return this.usersService.findAll();
//   }
// }
