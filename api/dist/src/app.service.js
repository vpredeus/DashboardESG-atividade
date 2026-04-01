"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppService = AppService_1 = class AppService {
    prisma;
    logger = new common_1.Logger(AppService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDados() {
        try {
            return await this.prisma.desafios.findMany();
        }
        catch (error) {
            this.logger.error("Erro ao buscar desafios no banco:", error);
            throw new common_1.InternalServerErrorException("Não foi possível recuperar os dados do banco.");
        }
    }
    async salvarDados(dados) {
        try {
            const mapped = dados.map((p) => ({
                postado: p.postado ? new Date(p.postado.replace(" ", "T")) : null,
                tipo: p.tipo ?? null,
                empresa: p.empresa ?? null,
                responsavel: p.responsavel ?? null,
                email: p.email ?? null,
                titulo_desafio: p.titulo ?? null,
                descricao_desafio: p.descricaoDesafio ?? null,
                descricao: p.descricao ?? null,
                area_primaria: p.areaPrimaria ?? null,
                area_secundaria: p.areaSecundaria ?? null,
                resumo: p.resumo ?? null,
                ods_1: p.ods1 ? parseInt(p.ods1, 10) : null,
                ods_2: p.ods2 ? parseInt(p.ods2, 10) : null,
                ods_3: p.ods3 ? parseInt(p.ods3, 10) : null,
                impacto_social_direto_num: p.impactoSocialDireto ?? null,
                impacto_social_indireto_num: p.impactoSocialIndireto ?? null,
                eixo: p.eixo ?? null,
                natureza: p.natureza ?? null,
            }));
            await this.prisma.desafios.deleteMany();
            const result = await this.prisma.desafios.createMany({
                data: mapped,
                skipDuplicates: true,
            });
            this.logger.log(`✅ ${result.count} registros salvos no banco.`);
            return { count: result.count };
        }
        catch (error) {
            this.logger.error("Erro ao salvar dados no banco:", error);
            throw new common_1.InternalServerErrorException("Falha ao salvar os dados no banco.");
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map