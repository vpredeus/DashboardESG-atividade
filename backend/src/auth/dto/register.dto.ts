import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	nome: string;

	@IsString()
	@IsNotEmpty()
	sobrenome: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	senha: string;
}
