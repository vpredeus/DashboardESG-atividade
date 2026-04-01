import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  const mockService = {
    getDados: jest.fn().mockResolvedValue([]),
    salvarDados: jest.fn().mockResolvedValue({ count: 1 }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("GET /indicadores", () => {
    it("deve retornar array de dados", async () => {
      const result = await appController.getDados();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("POST /dados", () => {
    it("deve retornar mensagem de sucesso e contagem", async () => {
      const result = await appController.salvarDados([{ titulo: "Teste" }]);
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("count");
    });
  });
});
