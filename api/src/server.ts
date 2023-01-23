import express from "express"
import cors from "cors"
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger';
import { GetFeriadosController } from './useCases/GetFeriados/GetFeriadosController';

const app = express()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    app.use(cors());
    next();
});

app.listen(3000, () => {
    //console.log(moment.now().toLocaleString())
    console.log("Server is running")
})


const getFeriadosController = new GetFeriadosController();
/**
* @swagger
* /feriados:
*   post:
*     description: Returna a lista de feriados possíveis de emenda dentro do período informado
*     responses:
*       200:
*         description: Um array de Feriados
*         schema:
*           type: array
*           items:
*             $ref: '#/definitions/User'
*/
app.post('/feriados', getFeriadosController.handle);