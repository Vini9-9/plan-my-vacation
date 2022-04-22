import TOKEN from '../../token'
import fetch from 'node-fetch'
import moment from 'moment'

export class GetFeriadosUseCase {

    constructor(){

    }

    async gerarListaFeriado(anos: Array<string>, estado: string): Promise<Array<string>> {
    
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
    
        return datas
        
    }

    filtrarFeriados(dataInicio:string, dataFim:string, feriados:Array<string>): string[]{
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

    filtrarDiaSemana(feriados:Array<string>){

        var periodo:Array<Object> = [];
    
        feriados.forEach((el) => {
            let data = el.split('-');
    
            let diaMoment = moment().set({'year': +data[0], 'month': +data[1]-1, 'date': +data[2]});
            let diaSemana = moment(diaMoment).day();
            if(diaSemana > 0 && diaSemana < 6){
                let objDia = {data: diaMoment, diaSemana:diaSemana};
                periodo.push(objDia)
            }
        })
    
        return periodo;
    }

    calcularPerido(periodoDiaSemana:Array<Object>, qtdDias:Number) {
    
        var periodoIdeal:Array<Object> = [];
    
        periodoDiaSemana.forEach((el: any) => {
            var diaMoment = el.data;
            var inicioFerias = diaMoment.subtract(qtdDias, 'days');
            let diaSemana = moment(inicioFerias).day();
            if(diaSemana > 0 && diaSemana < 6){
                let objDia = {diaInicio: inicioFerias, diaSemana: diaSemana};
                periodoIdeal.push(objDia)
            }
    
        })
    
        return periodoIdeal
    }

    compararDiaSemana(a:any,b:any) {
        if (a.diaSemana < b.diaSemana)
           return -1;
        if (a.diaSemana > b.diaSemana)
          return 1;
        return 0;
      }
    
    ordenarPeriodos(periodosIdeais:Array<Object>) {
    
        return periodosIdeais.sort(this.compararDiaSemana);
        
    }
}

