import { Request, Response } from 'express'
import { GetFeriadosUseCase } from './GetFeriadosUseCase'

export class GetFeriadosController {

    constructor(){

    }

    async handle(request: Request, response: Response){
        
        const {qtdDias, estado, cidade, dataInicio, dataFim} = request.body
        console.log('request.body', request.body)

        var anoInicio = dataInicio.split('-')[0]
        var anoFim = dataFim.split('-')[0]
        var anos = [anoInicio, anoFim]

        const getFeriadosUseCase = new GetFeriadosUseCase()

        const datasFeriados = await getFeriadosUseCase.gerarListaFeriado(anos, estado)

        const feriados = getFeriadosUseCase.filtrarFeriados(dataInicio, dataFim, datasFeriados)

        const periodoDiaSemana = getFeriadosUseCase.filtrarDiaSemana(feriados) 

        const periodosIdeais = getFeriadosUseCase.calcularPerido(periodoDiaSemana, qtdDias) 

        const periodosOrdenados = getFeriadosUseCase.ordenarPeriodos(periodosIdeais)

        return response.status(200).json({
            "message": "OK",
            "feriados": feriados,
            "periodosIdeias": periodosOrdenados
        })
    }
}