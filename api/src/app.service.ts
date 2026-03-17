import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const jsonString = '{ "indicadores": [ { "projeto": "Horta Comunitária", "categoria": "Ambiental", "impacto": 120 }, { "projeto": "Capacitação Profissional", "categoria": "Social", "impacto": 80 }, { "projeto": "Reciclagem Urbana", "categoria": "Ambiental", "impacto": 150 }, { "projeto": "Inclusão Digital", "categoria": "Social", "impacto": 60 } ] }';
    const obj = JSON.parse(jsonString);

    return obj;
  }
}
