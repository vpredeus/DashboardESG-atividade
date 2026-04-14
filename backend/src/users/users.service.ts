import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
	nome: string;
	sobrenome: string;
	email: string;
	senha: string;
};

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

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
		return this.prisma.usuarios.create({
			data: {
				nome: data.nome.trim(),
				sobrenome: data.sobrenome.trim(),
				email: data.email.toLowerCase().trim(),
				senha: data.senha,
			},
			select: {
				id: true,
				nome: true,
				sobrenome: true,
				email: true,
				role: true,
			},
		});
	}
}
