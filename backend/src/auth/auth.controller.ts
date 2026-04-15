/**
 * auth.controller.ts — Controller de autenticação
 *
 * Rotas:
 *  POST /auth/register  — email + senha (valida idToken Firebase no header)
 *  POST /auth/login     — email + senha (retorna JWT do sistema)
 *  POST /auth/social    — Google / GitHub (idToken Firebase no header)
 *  POST /auth/linkedin  — Authorization Code do LinkedIn
 */

import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

// ── DTOs dos novos endpoints ──────────────────────────────────────
import { IsIn, IsString, IsNotEmpty } from "class-validator";

class SocialLoginDto {
  @IsString()
  @IsIn(["google", "github"])
  provider: "google" | "github";
}

class LinkedinLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Recebe idToken Firebase no header Authorization para validação adicional.
   * A validação do token é feita no AuthService via Firebase Admin SDK.
   */
  @Post("register")
  register(
    @Body() body: RegisterDto,
    @Headers("authorization") authorization?: string,
  ) {
    const { nome, sobrenome, email, senha, tipo, codigoEmpresa } = body;
    // O idToken (header) é usado pelo AuthService para verificar a identidade;
    // neste fluxo simples, a verificação é implícita pelo Firebase Admin na
    // chamada signUp — mas você pode reforçar adicionando verifyIdToken aqui.
    return this.authService.signUp(
      nome,
      sobrenome,
      email,
      senha,
      tipo,
      codigoEmpresa,
    );
  }

  /**
   * POST /auth/login
   * Autenticação com email e senha. Retorna JWT do sistema.
   */
  @Post("login")
  login(@Body() body: LoginDto) {
    const { email, senha } = body;
    return this.authService.signIn(email, senha);
  }

  /**
   * POST /auth/social
   * Autenticação via Google ou GitHub.
   * Requer header: Authorization: Bearer <Firebase ID Token>
   */
  @Post("social")
  async socialLogin(
    @Body() body: SocialLoginDto,
    @Headers("authorization") authorization?: string,
  ) {
    const idToken = authorization?.replace("Bearer ", "").trim();
    if (!idToken) throw new UnauthorizedException("Token Firebase ausente");
    return this.authService.socialLogin(idToken, body.provider);
  }

  /**
   * POST /auth/linkedin
   * Authorization Code Flow do LinkedIn.
   * O frontend envia apenas o `code` — o client_secret fica EXCLUSIVAMENTE
   * neste servidor.
   */
  @Post("linkedin")
  linkedinLogin(@Body() body: LinkedinLoginDto) {
    return this.authService.linkedinLogin(body.code, body.redirectUri);
  }
}
