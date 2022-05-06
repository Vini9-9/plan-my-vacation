import { Request, Response } from 'express'
import listaFeriados from './listaFeriados'
import { GetFeriadosUseCase } from './GetFeriadosUseCase'
import moment from 'moment'

export class GetFeriadosController {

    constructor(){

    }

    async handle(request: Request, response: Response){
        
        const {qtdDias, estado, cidade, dataInicio, dataFim} = request.body

        const getFeriadosUseCase = new GetFeriadosUseCase()

        if(!getFeriadosUseCase.validarDatas(dataInicio, dataFim)){
            return response.status(400).json({
                "status": "error",
                "mensagem": "Data inicio deve ser antes da data fim"
            })
        }

        var anoInicio = moment(dataInicio).year()
        var anoFim = moment(dataFim).year()

        const anos: number[] = gerarAnos(anoInicio, anoFim)

        function gerarAnos(anoInicio:number, anoFim:number){
            var anos = [];
            
            for (var de = anoInicio, ate = anoFim; de <= ate; de++){
                anos.push(de);
            }
            
            return anos
        }

        var feriadosObj: object[] = [{}];

        await getFeriadosUseCase.gerarListaFeriado(anos, estado)
        .then((res) => {
            res.length <= 1 ? feriadosObj = listaFeriados : feriadosObj = res;
        })
        .catch(() => {
            feriadosObj = listaFeriados
        })

        const feriadosFiltrados = getFeriadosUseCase.filtrarFeriados(dataInicio, dataFim, feriadosObj)
        console.log('feriadosFiltrados', feriadosFiltrados)

        const periodoDiaSemana = getFeriadosUseCase.filtrarDiaSemana(feriadosFiltrados) 
        
        const periodosIdeais = getFeriadosUseCase.calcularPerido(periodoDiaSemana, qtdDias) 

        const periodosOrdenados = getFeriadosUseCase.ordenarPeriodos(periodosIdeais)

        return response.status(200).json({
            "status": "OK",
            // "feriados": feriadosObj,
            "periodosIdeias": periodosOrdenados
        })
    }
}