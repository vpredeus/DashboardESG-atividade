import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  // Valida variável de ambiente antes de qualquer coisa
  if (!process.env.DATABASE_URL) {
    console.error(
      "❌ ERRO: variável de ambiente DATABASE_URL não está definida.",
    );
    console.error(
      '   Crie um arquivo .env na raiz com: DATABASE_URL="postgresql://user:senha@host:5432/db"',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // CORS — necessário para o frontend (localhost ou domínio) conseguir fazer POST
  app.enableCors({
    origin: "*", // em produção, troque por ['https://seudominio.com']
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const config = new DocumentBuilder()
    .setTitle("ENIAC ESG API")
    .setDescription(
      "API de indicadores ESG — recebe dados do CSV e persiste no PostgreSQL",
    )
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📄 Swagger disponível em http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error("Erro ao iniciar a aplicação:", err);
  process.exit(1);
});
