import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() body: RegisterDto) {
		const { nome, sobrenome, email, senha, tipo, codigoEmpresa } = body;
		return this.authService.signUp(nome, sobrenome, email, senha, tipo, codigoEmpresa);
	}

	@Post('login')
	login(@Body() body: LoginDto) {
		const { email, senha } = body;
		return this.authService.signIn(email, senha);
	}
}
