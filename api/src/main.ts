import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "dotenv/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite do body para 10 MB — cobre CSVs grandes após parse em JSON.
  // O padrão do NestJS/Express é 100 KB, insuficiente para arquivos maiores.
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  // Permite que o front-end (qualquer origem em dev) acesse a API
  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const config = new DocumentBuilder()
    .setTitle("Minha API")
    .setDescription("Documentação da API")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error("Erro ao iniciar a aplicação:", err);
  process.exit(1);
});
