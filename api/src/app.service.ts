import { Injectable } from '@nestjs/common';
import projetos from '../data/projetos.json';

@Injectable()
export class AppService {
  getDados(): object {
    const jsonString = projetos;

    return jsonString;
  }
}
