import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

    async signUp(
        nome: string,
        sobrenome: string,
        email: string,
        senha: string,
    ) {
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new BadRequestException('Email em uso');
        }

        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(senha, salt, 32)) as Buffer;
        const senhaHash = `${salt}.${hash.toString('hex')}`;

        await this.usersService.createUser({
            nome,
            sobrenome,
            email,
            senha: senhaHash,
        });

        return {
            message: 'Usuario cadastrado com sucesso',
        };
    }

    async signIn(email: string, senha: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const [salt, storedHash] = user.senha.split('.');
        const hash = (await scrypt(senha, salt, 32)) as Buffer;

        if (storedHash !== hash.toString('hex')) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = { email: user.email, role: user.role, sub: user.id };
        return { accessToken: this.jwtService.sign(payload) };
    }
}
