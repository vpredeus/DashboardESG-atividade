import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DesafioInput } from "./app.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { Roles } from "./common/decorators/roles.decorator";

@ApiTags("Indicadores")
@Controller("indicadores")
export class AppController {
  constructor(private appService: AppService) {}

  @ApiOperation({ summary: "Lista os indicadores" })
  @Get()
  getDados(): object {
    return this.appService.getDados();
  }

  @ApiOperation({ summary: "Criar múltiplos desafios e ignorar duplicatas" })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  criarDesafios(@Body() dados: DesafioInput[] | { desafios: DesafioInput[] }): Promise<object> {
    const desafios = Array.isArray(dados) ? dados : dados.desafios;
    return this.appService.criarDesafios(desafios);
  }

  @ApiOperation({ summary: "Remove todos os desafios salvos no banco" })
  @ApiResponse({ status: 200, description: "Dados removidos com sucesso." })
  @Delete("dados")
  async apagarDados(): Promise<{ message: string; count: number }> {
    const result = await this.appService.apagarTodosDados();
    return { message: "Dados removidos com sucesso.", count: result.count };
  }
}
