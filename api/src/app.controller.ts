import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Indicadores')
@Controller('indicadores')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Lista os indicadores' })
  @Get()
  getDados(): object {
    return this.appService.getDados();
  }
}
