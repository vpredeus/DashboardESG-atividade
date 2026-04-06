import { Controller, Get, Post, Body } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DesafioInput } from "./app.service";

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
  criarDesafios(
    @Body() dados: DesafioInput[] | { desafios: DesafioInput[] },
  ): Promise<object> {
    const desafios = Array.isArray(dados) ? dados : dados.desafios;
    return this.appService.criarDesafios(desafios);
  }
}
