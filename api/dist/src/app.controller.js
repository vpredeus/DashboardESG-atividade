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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const swagger_1 = require("@nestjs/swagger");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getDados() {
        return this.appService.getDados();
    }
    criarDesafios(dados) {
        const desafios = Array.isArray(dados) ? dados : dados.desafios;
        return this.appService.criarDesafios(desafios);
    }
    async apagarDados() {
        const result = await this.appService.apagarTodosDados();
        return { message: "Dados removidos com sucesso.", count: result.count };
    }
};
exports.AppController = AppController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Lista os indicadores" }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AppController.prototype, "getDados", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Criar múltiplos desafios e ignorar duplicatas" }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "criarDesafios", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Remove todos os desafios salvos no banco" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Dados removidos com sucesso." }),
    (0, common_1.Delete)("dados"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "apagarDados", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)("Indicadores"),
    (0, common_1.Controller)("indicadores"),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map