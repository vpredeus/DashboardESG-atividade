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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppService = class AppService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDados() {
        return this.prisma.desafios.findMany();
    }
    async criarDesafios(desafios) {
        const salvos = [];
        const ignorados = [];
        for (const desafio of desafios) {
            const postadoDate = this.parsePostado(desafio.postado);
            if (postadoDate) {
                const existePorPostado = await this.prisma.desafios
                    .findUnique({ where: { postado: postadoDate } })
                    .catch(() => null);
                if (existePorPostado) {
                    const ehLinhaIdentica = this.compararCampos(existePorPostado, desafio, postadoDate);
                    ignorados.push({
                        desafio,
                        motivo: ehLinhaIdentica
                            ? "Linha completamente idêntica já existe no banco"
                            : "Registro com este horário de postagem já existe",
                    });
                    continue;
                }
            }
            const duplicataCompleta = await this.encontrarLinhaIdentica(desafio, postadoDate);
            if (duplicataCompleta) {
                ignorados.push({
                    desafio,
                    motivo: "Linha completamente idêntica já existe no banco",
                });
                continue;
            }
            const parseOds = (v) => {
                if (v === null || v === undefined || v === "")
                    return null;
                const n = Number(v);
                return Number.isFinite(n) ? Math.round(n) : null;
            };
            const data = {
                postado: postadoDate,
                tipo: desafio.tipo ?? null,
                empresa: desafio.empresa ?? null,
                responsavel: desafio.responsavel ?? null,
                email: desafio.email ?? null,
                titulo_desafio: desafio.titulo_desafio ?? null,
                descricao_desafio: desafio.descricao_desafio ?? null,
                descricao: desafio.descricao ?? null,
                area_primaria: desafio.area_primaria ?? null,
                area_secundaria: desafio.area_secundaria ?? null,
                resumo: desafio.resumo ?? null,
                ods_1: parseOds(desafio.ods_1),
                ods_2: parseOds(desafio.ods_2),
                ods_3: parseOds(desafio.ods_3),
                impacto_social_direto_num: desafio.impacto_social_direto_num ?? null,
                impacto_social_indireto_num: desafio.impacto_social_indireto_num ?? null,
                eixo: desafio.eixo ?? null,
                natureza: desafio.natureza ?? null,
            };
            const desafioCreated = await this.prisma.desafios.create({ data });
            salvos.push(desafioCreated);
        }
        return {
            salvos: salvos.length,
            ignorados: ignorados.length,
            detalhes: { salvos, ignorados },
        };
    }
    async encontrarLinhaIdentica(desafio, postadoDate) {
        const norm = (v) => v === undefined || v === null || v === "" ? null : v;
        const where = {
            postado: postadoDate ?? null,
            tipo: norm(desafio.tipo),
            empresa: norm(desafio.empresa),
            responsavel: norm(desafio.responsavel),
            email: norm(desafio.email),
            titulo_desafio: norm(desafio.titulo_desafio),
            descricao_desafio: norm(desafio.descricao_desafio),
            descricao: norm(desafio.descricao),
            area_primaria: norm(desafio.area_primaria),
            area_secundaria: norm(desafio.area_secundaria),
            resumo: norm(desafio.resumo),
            ods_1: norm(desafio.ods_1),
            ods_2: norm(desafio.ods_2),
            ods_3: norm(desafio.ods_3),
            impacto_social_direto_num: norm(desafio.impacto_social_direto_num),
            impacto_social_indireto_num: norm(desafio.impacto_social_indireto_num),
            eixo: norm(desafio.eixo),
            natureza: norm(desafio.natureza),
        };
        return this.prisma.desafios.findFirst({ where }).catch(() => null);
    }
    compararCampos(salvo, input, postadoDate) {
        const norm = (v) => v == null || v === "" ? null : String(v).trim();
        const normDate = (d) => d?.toISOString() ?? null;
        return (normDate(salvo.postado) === normDate(postadoDate) &&
            norm(salvo.tipo) === norm(input.tipo) &&
            norm(salvo.empresa) === norm(input.empresa) &&
            norm(salvo.responsavel) === norm(input.responsavel) &&
            norm(salvo.email) === norm(input.email) &&
            norm(salvo.titulo_desafio) === norm(input.titulo_desafio) &&
            norm(salvo.descricao_desafio) === norm(input.descricao_desafio) &&
            norm(salvo.descricao) === norm(input.descricao) &&
            norm(salvo.area_primaria) === norm(input.area_primaria) &&
            norm(salvo.area_secundaria) === norm(input.area_secundaria) &&
            norm(salvo.resumo) === norm(input.resumo) &&
            norm(salvo.ods_1) === norm(input.ods_1) &&
            norm(salvo.ods_2) === norm(input.ods_2) &&
            norm(salvo.ods_3) === norm(input.ods_3) &&
            norm(salvo.impacto_social_direto_num) ===
                norm(input.impacto_social_direto_num) &&
            norm(salvo.impacto_social_indireto_num) ===
                norm(input.impacto_social_indireto_num) &&
            norm(salvo.eixo) === norm(input.eixo) &&
            norm(salvo.natureza) === norm(input.natureza));
    }
    parsePostado(postado) {
        if (!postado)
            return null;
        const parsedDate = postado instanceof Date ? postado : new Date(postado);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
//# sourceMappingURL=app.service.js.map