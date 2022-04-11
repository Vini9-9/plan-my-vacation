import express from "express"
import fetch from 'node-fetch'
import cors from "cors"
import moment from 'moment'
import TOKEN from './token'

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

app.listen(3000, () => {
    console.log("Server is running")
})

app.get('/', async (req, res) =>{
    const {qtdDias, estado, cidade, dataInicio, dataFim} = req.body

    var anoInicio = dataInicio.split('-')[0]
    var anoFim = dataFim.split('-')[0]
    var anos = [anoInicio, anoFim]

    const datasFeriados = await gerarListaFeriado(anos, estado)
    
    const feriados = filtrarFeriados(dataInicio, dataFim, datasFeriados)

    const periodoDiaSemana = filtrarDiaSemana(feriados) 

    // console.log(periodoDiaSemana)

    const periodosIdeais = calcularPerido(periodoDiaSemana, qtdDias) 

    const periodosOrdenados = ordenarPeriodos(periodosIdeais)

    //console.log(datasFeriados)
    
    /* gerarFeriadoMunicipal(cidade) */
    
    return res.status(200).json({
        "message": "OK",
        "feriados": feriados,
        "periodosIdeias": periodosOrdenados
    })
});

function compararDiaSemana(a:any,b:any) {
    if (a.diaSemana < b.diaSemana)
       return -1;
    if (a.diaSemana > b.diaSemana)
      return 1;
    return 0;
  }

function ordenarPeriodos(periodosIdeais:Array<Object>) {

    return periodosIdeais.sort(compararDiaSemana);
    
}

function calcularPerido(periodoDiaSemana:Array<Object>, qtdDias:Number) {
    
    var periodoIdeal:Array<Object> = [];

    periodoDiaSemana.forEach((el) => {
        var diaMoment = el.data;
        //console.log(diaMoment)
        var inicioFerias = diaMoment.subtract(qtdDias, 'days');
        //console.log(inicioFerias)

        let diaSemana = moment(inicioFerias).day();
        if(diaSemana > 0 && diaSemana < 6){
            let objDia = {diaInicio: inicioFerias, diaSemana: diaSemana};
            periodoIdeal.push(objDia)
        }

    })

    return periodoIdeal
}

function filtrarDiaSemana(feriados:Array<string>){

    var periodo:Array<Object> = [];

    feriados.forEach((el) => {
        let data = el.split('-');

        let diaMoment = moment().set({'year': +data[0], 'month': +data[1]-1, 'date': +data[2]});
        let diaSemana = moment(diaMoment).day();
        //console.log(el, diaSemana);
        if(diaSemana > 0 && diaSemana < 6){
            let objDia = {data: diaMoment, diaSemana:diaSemana};
            periodo.push(objDia)
        }
    })

    return periodo;
}

async function gerarListaFeriado(anos: Array<string>, estado: string) {
    
    const apiFeriados = `https://api.invertexto.com/v1/holidays/${anos[0]}?token=${TOKEN}&state=${estado}`
    const response = await fetch(apiFeriados)
    var dado = await response.json();

    if(anos[0] != anos[1]) {
        const apiFeriadosAnoFim = `https://api.invertexto.com/v1/holidays/${anos[1]}?token=${TOKEN}&state=${estado}`
        const responseAnoFIm = await fetch(apiFeriadosAnoFim)
        var dadoAnoFim = await responseAnoFIm.json();
        dado = dado.concat(dadoAnoFim);
    } 

    var datas = dado.map((el: { date: any }) => el.date)

    console.log(dado)
    return datas
    
}

function filtrarFeriados(dataInicio:string, dataFim:string, feriados:Array<string>) {
    var dataInicioArray = dataInicio.split('-')
    var dataFimArray = dataFim.split('-')

    var feriadosFiltradosInicio = feriados.filter((el) => {
        var mesFeriado = parseInt(el.split('-')[1])
        var diaFeriado = parseInt(el.split('-')[2])

        var mesmoMesDiaMaior = parseInt(dataInicioArray[1]) == mesFeriado && parseInt(dataInicioArray[2]) < diaFeriado

        return parseInt(dataInicioArray[1]) < mesFeriado || mesmoMesDiaMaior
    })

    var feriadosFiltradosFim = feriadosFiltradosInicio.filter((el) => {
        var mesFeriado = parseInt(el.split('-')[1])
        var diaFeriado = parseInt(el.split('-')[2])

        var mesmoMesDiaMenor = parseInt(dataFimArray[1]) == mesFeriado && parseInt(dataFimArray[2]) > diaFeriado

        return parseInt(dataFimArray[1]) > mesFeriado || mesmoMesDiaMenor
    })

    return feriadosFiltradosFim
}
