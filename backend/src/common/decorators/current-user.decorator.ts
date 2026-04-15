import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type AuthenticatedUser = {
	id?: number;
	email?: string;
	role?: string;
    nome?: string;
    sobrenome?: string;
};

export const CurrentUser = createParamDecorator(
	(field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
		const user = request.user;

		if (!field) {
			return user;
		}

		return user?.[field];
	},
);
