<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
=======
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
>>>>>>> feature/banco-de-dados
    }).compile();

    appController = app.get<AppController>(AppController);
  });

<<<<<<< HEAD
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
=======
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
>>>>>>> feature/banco-de-dados
    });
  });
});
