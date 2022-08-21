import express from "express"
import cors from "cors"
import { GetFeriadosController } from './useCases/GetFeriados/GetFeriadosController';

const port = process.env.PORT || 3000;
const app = express()

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

app.listen(port, () => {
    //console.log(moment.now().toLocaleString())
    console.log("Server is running")
})


const getFeriadosController = new GetFeriadosController();

 app.post('/feriados', getFeriadosController.handle);