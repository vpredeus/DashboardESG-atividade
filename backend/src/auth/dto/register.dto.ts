import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
	ValidateIf,
} from 'class-validator';

export type TipoCadastro = 'usuario' | 'empresa';

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

	@IsOptional()
	@IsIn(['usuario', 'empresa'])
	tipo?: TipoCadastro;

	@ValidateIf((o: RegisterDto) => o.tipo === 'empresa')
	@IsString()
	@IsNotEmpty()
	codigoEmpresa?: string;
}
