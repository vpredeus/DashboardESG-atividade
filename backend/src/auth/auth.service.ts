import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TipoCadastro } from "./dto/register.dto";
import * as admin from "firebase-admin";
import axios from "axios";

const scrypt = promisify(_scrypt);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n",
      ),
    }),
  });
}

// ✅ Tipo local que representa apenas os campos necessários para emitir o JWT.
// Compatível com o retorno completo de createUser (que inclui senha, criado_em, etc.)
type JwtUser = {
  id: number;
  email: string;
  role: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ── REGISTRO (email + senha) ──────────────────────────────────
  async signUp(
    nome: string,
    sobrenome: string,
    email: string,
    senha: string,
    tipo: TipoCadastro = "usuario",
    codigoEmpresa?: string,
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException("Email em uso");

    let role: "user" | "admin" = "user";

    if (tipo === "empresa") {
      const empresaCode =
        this.configService.get<string>("EMPRESA_ACCESS_CODE") ??
        this.configService.get<string>("EMPRESA_REGISTRATION_CODE");

      if (!empresaCode)
        throw new BadRequestException(
          "Cadastro empresarial indisponivel no momento",
        );

      if (!codigoEmpresa || codigoEmpresa !== empresaCode)
        throw new BadRequestException("Codigo de empresa invalido");

      role = "admin";
    }

    const salt = randomBytes(8).toString("hex");
    const hash = (await scrypt(senha, salt, 32)) as Buffer;
    const senhaHash = `${salt}.${hash.toString("hex")}`;

    await this.usersService.createUser({
      nome,
      sobrenome,
      email,
      senha: senhaHash,
      role,
    });

    return { message: "Usuario cadastrado com sucesso" };
  }

  // ── LOGIN (email + senha) ─────────────────────────────────────
  async signIn(email: string, senha: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException("Credenciais invalidas");

    const [salt, storedHash] = user.senha.split(".");
    const hash = (await scrypt(senha, salt, 32)) as Buffer;

    if (storedHash !== hash.toString("hex"))
      throw new UnauthorizedException("Credenciais invalidas");

    return this._emitirJWT(user);
  }

  // ── LOGIN SOCIAL (Google / GitHub via Firebase idToken) ───────
  async socialLogin(idToken: string, provider: "google" | "github") {
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException("Token Firebase invalido ou expirado");
    }

    const { email, name, uid } = decodedToken;
    if (!email)
      throw new BadRequestException(
        "A conta social nao possui e-mail associado",
      );

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const [nome = "", ...restArr] = (name ?? email.split("@")[0]).split(" ");
      const sobrenome = restArr.join(" ") || "";

      const salt = randomBytes(8).toString("hex");
      const hash = (await scrypt(uid, salt, 32)) as Buffer;
      const senhaHash = `${salt}.${hash.toString("hex")}`;

      // ✅ createUser retorna o tipo completo do Prisma (inclui senha, criado_em)
      // Atribuímos diretamente sem re-declarar o tipo da variável
      user = await this.usersService.createUser({
        nome,
        sobrenome,
        email,
        senha: senhaHash,
        role: "user" as const,
      });
    }

    // ✅ Após o if acima, user pode ainda ser null apenas se findByEmail e
    // createUser ambos falharem — o guard abaixo cobre esse caso.
    if (!user) throw new InternalServerErrorException("Erro ao criar usuario");
    return this._emitirJWT(user);
  }

  // ── LOGIN LINKEDIN (Authorization Code Flow) ──────────────────
  async linkedinLogin(code: string, redirectUri: string) {
    const clientId =
      this.configService.getOrThrow<string>("LINKEDIN_CLIENT_ID");
    const clientSecret = this.configService.getOrThrow<string>(
      "LINKEDIN_CLIENT_SECRET",
    );

    let accessToken: string;
    try {
      const tokenRes = await axios.post<{ access_token: string }>(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
      accessToken = tokenRes.data.access_token;
    } catch {
      throw new UnauthorizedException("Falha ao obter token do LinkedIn");
    }

    let profile: {
      sub: string;
      name?: string;
      email?: string;
      given_name?: string;
      family_name?: string;
    };

    try {
      const profileRes = await axios.get(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      profile = profileRes.data as typeof profile;
    } catch {
      throw new InternalServerErrorException(
        "Nao foi possivel obter o perfil do LinkedIn",
      );
    }

    const email = profile.email;
    if (!email) {
      throw new BadRequestException(
        "A conta LinkedIn nao possui e-mail verificado.",
      );
    }

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const nome =
        profile.given_name ?? (profile.name ?? "").split(" ")[0] ?? "";
      const sobrenome =
        profile.family_name ??
        (profile.name ?? "").split(" ").slice(1).join(" ") ??
        "";

      const salt = randomBytes(8).toString("hex");
      const hash = (await scrypt(profile.sub, salt, 32)) as Buffer;
      const senhaHash = `${salt}.${hash.toString("hex")}`;

      // ✅ Mesmo padrão: createUser retorna o objeto completo
      user = await this.usersService.createUser({
        nome,
        sobrenome,
        email,
        senha: senhaHash,
        role: "user" as const,
      });
    }

    if (!user) throw new InternalServerErrorException("Erro ao criar usuario");
    return this._emitirJWT(user);
  }

  // ── Helper: emite o JWT do sistema ───────────────────────────
  // ✅ Aceita JwtUser (subconjunto) — compatível com o tipo completo do Prisma
  private _emitirJWT(user: JwtUser) {
    const payload = {
      email: user.email,
      role: user.role ?? "user",
      sub: user.id,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
