import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags("Indicadores")
@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @ApiOperation({ summary: "Lista todos os indicadores salvos no banco" })
  @ApiResponse({ status: 200, description: "Retorna array de desafios." })
  @Get("indicadores")
  async getDados(): Promise<object[]> {
    return await this.appService.getDados();
  }

  @ApiOperation({ summary: "Recebe e salva os dados do CSV no banco" })
  @ApiBody({ description: "Array de objetos de projeto ESG", type: [Object] })
  @ApiResponse({ status: 200, description: "Dados salvos com sucesso." })
  @HttpCode(HttpStatus.OK)
  @Post("dados")
  async salvarDados(
    @Body() dados: object[],
  ): Promise<{ message: string; count: number }> {
    const result = await this.appService.salvarDados(dados);
    return { message: "Dados salvos com sucesso.", count: result.count };
  }

  @ApiOperation({ summary: "Remove todos os desafios salvos no banco" })
  @ApiResponse({ status: 200, description: "Dados removidos com sucesso." })
  @Delete("dados")
  async apagarDados(): Promise<{ message: string; count: number }> {
    const result = await this.appService.apagarTodosDados();
    return { message: "Dados removidos com sucesso.", count: result.count };
  }
}
