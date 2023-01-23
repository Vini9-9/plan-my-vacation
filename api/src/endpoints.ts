import { Express } from 'express-serve-static-core';
import { GetFeriadosController } from './useCases/GetFeriados/GetFeriadosController';

export default function configureEndpoints(app: Express) {
    const getFeriadosController = new GetFeriadosController();

    app.post('/feriados', getFeriadosController.handle);
}
  