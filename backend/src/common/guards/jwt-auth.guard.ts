import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest<TUser = unknown>(
		err: unknown,
		user: unknown,
		info: unknown,
		context: ExecutionContext,
		status?: unknown,
	): TUser {
		void info;
		void context;
		void status;

		if (err || !user) {
			throw new UnauthorizedException('Token invalido ou ausente');
		}
		return user as TUser;
	}
}