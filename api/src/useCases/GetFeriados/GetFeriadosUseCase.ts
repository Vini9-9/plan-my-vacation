import TOKEN from '../../token'
import fetch from 'node-fetch'
import moment from 'moment'

interface FeriadoDTO {
    date: string;
    feriado: string;
}

export class GetFeriadosUseCase {

    constructor(){

    }

    async gerarListaFeriado(anos: Array<string>, estado: string): Promise<Array<FeriadoDTO>> {
    
        const apiFeriados = `https://api.invertexto.com/v1/holidays/${anos[0]}?token=${TOKEN}&state=${estado}`
        const response = await fetch(apiFeriados)
        var dado = await response.json();
    
        if(anos[0] != anos[1]) {
            const apiFeriadosAnoFim = `https://api.invertexto.com/v1/holidays/${anos[1]}?token=${TOKEN}&state=${estado}`
            const responseAnoFIm = await fetch(apiFeriadosAnoFim)
            var dadoAnoFim = await responseAnoFIm.json();
            dado = dado.concat(dadoAnoFim);
        } 
    
        var feriados = dado.map((el: { name: string, date: string  }) => {
            return {date: el.date, feriado: el.name}
        })
    
        return feriados
        
    }

    filtrarFeriados(dataInicio:string, dataFim:string, feriados:Array<object>): object[]{
        var dataInicioArray = dataInicio.split('-')
        var dataFimArray = dataFim.split('-')

        var feriadosFiltradosInicio = feriados.filter((el: any) => {
            var mesFeriado = parseInt(el.date.split('-')[1])
            var diaFeriado = parseInt(el.date.split('-')[2])

            var mesmoMesDiaMaior = parseInt(dataInicioArray[1]) == mesFeriado && parseInt(dataInicioArray[2]) < diaFeriado

            return parseInt(dataInicioArray[1]) < mesFeriado || mesmoMesDiaMaior
        })

        var feriadosFiltradosFim = feriadosFiltradosInicio.filter((el: any) => {
            var mesFeriado = parseInt(el.date.split('-')[1])
            var diaFeriado = parseInt(el.date.split('-')[2])

            var mesmoMesDiaMenor = parseInt(dataFimArray[1]) == mesFeriado && parseInt(dataFimArray[2]) > diaFeriado

            return parseInt(dataFimArray[1]) > mesFeriado || mesmoMesDiaMenor
        })

        return feriadosFiltradosFim
        
    }

    filtrarDiaSemana(feriados:Array<object>){

        var periodo:Array<Object> = [];
    
        feriados.forEach((el: any) => {
            let data = el.date.split('-');
    
            let diaMoment = moment().set({'year': +data[0], 'month': +data[1]-1, 'date': +data[2]});
            let diaSemana = moment(diaMoment).day();
            if(diaSemana > 0 && diaSemana < 6){
                let objDia = {data: diaMoment, diaSemana:diaSemana, feriado: el.feriado};
                periodo.push(objDia)
            }
        })
    
        return periodo;
    }

    calcularPerido(periodoDiaSemana:Array<Object>, qtdDias:Number) {
    
        var periodoIdeal:Array<Object> = [];
    
        periodoDiaSemana.forEach((el: any) => {
            const diaMoment = el.data.clone() //dia do feriado
            var inicioFerias = diaMoment.subtract(qtdDias, 'days');
            let diaSemana = moment(inicioFerias).day();
            if(diaSemana > 0 && diaSemana < 6){
                inicioFerias = inicioFerias.format('DD/MM/YYYY')
                let qtdDiasExtras = calcularQtdDias(el.data)
                let totalDias = +qtdDias + +qtdDiasExtras;
                var voltaFerias = diaMoment.add(totalDias, 'days');
                let diaSemanaFim = moment(voltaFerias).day();
                voltaFerias = voltaFerias.format('DD/MM/YYYY')
                let objDia = {qtdDias: totalDias, feriado: el.feriado,
                     diaInicio: inicioFerias, diaSemanaInicio: diaSemana,
                     diaFim: voltaFerias, diaSemanaFim};
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

function calcularQtdDias(diaFeriado: any) :Number{
    var diaSemana = moment(diaFeriado).day()

    if(diaSemana == 5){
        return 3
    }

    return 1
}

