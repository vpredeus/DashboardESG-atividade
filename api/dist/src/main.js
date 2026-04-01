"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ ERRO: variável de ambiente DATABASE_URL não está definida.");
        console.error('   Crie um arquivo .env na raiz com: DATABASE_URL="postgresql://user:senha@host:5432/db"');
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("ENIAC ESG API")
        .setDescription("API de indicadores ESG — recebe dados do CSV e persiste no PostgreSQL")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📄 Swagger disponível em http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
    console.error("Erro ao iniciar a aplicação:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map