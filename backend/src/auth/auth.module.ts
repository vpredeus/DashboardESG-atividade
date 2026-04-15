/**
 * auth.module.ts — Módulo de autenticação NestJS
 *
 * Instalar dependências:
 *   npm install firebase-admin axios
 *
 * Variáveis de ambiente necessárias (.env):
 *   JWT_SECRET=...
 *   EMPRESA_ACCESS_CODE=...
 *   FIREBASE_PROJECT_ID=dashboard-esg-3aaff
 *   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@dashboard-esg-3aaff.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *   LINKEDIN_CLIENT_ID=...
 *   LINKEDIN_CLIENT_SECRET=...
 *
 * Como obter as credenciais do Firebase Admin:
 *   Firebase Console → Configurações do Projeto → Contas de Serviço
 *   → Gerar nova chave privada → salve o JSON
 *   → extraia projectId, clientEmail e privateKey para o .env
 */

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "dev-secret-change-me",
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
