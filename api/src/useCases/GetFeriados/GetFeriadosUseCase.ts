import TOKEN from '../../token'
import fetch from 'node-fetch'
import moment from 'moment'

interface FeriadoDTO {
    date: string;
    feriado: string;
}

interface FeriadoObj {
    date: string;
    name: string;
    type: string;
    level: string;
}

export class GetFeriadosUseCase {

    constructor(){

    }

    async gerarListaFeriado(anos: number[], estado: string): Promise<Array<FeriadoDTO>> {
        var dadosAnos: FeriadoObj[]= [];

        for (const ano of anos) {
            console.log('ano', ano)
            const apiFeriados = `https://api.invertexto.com/v1/holidays/${ano}?token=${TOKEN}&state=${estado}`
            const response = await fetch(apiFeriados)
            var dadoAno = await response.json();
            dadosAnos = dadosAnos.concat(dadoAno);
        }

        var feriados = dadosAnos.map((el) => {
            return {date: el.date, feriado: el.name}
        })
    
        return feriados
        
    }

    filtrarFeriados(dataInicio:string, dataFim:string, feriados:Array<object>): object[]{
        const dataInicioMom = moment(dataInicio, 'YYYY-MM-DD'); 
        const dataFimMom = moment(dataFim, 'YYYY-MM-DD'); 

        var feriadosFiltrados = feriados.filter((el: any) => {
            const dataFeriadoMom = moment(el.date, 'YYYY-MM-DD')
            return dataFeriadoMom.isBetween(dataInicioMom, dataFimMom, undefined, '[]');
        })

        return feriadosFiltrados
        
    }

    filtrarDiaSemana(feriados:Array<object>){

        var periodo:Array<Object> = [];
    
        feriados.forEach((el: any) => {
            let diaMoment = moment(el.date, 'YYYY-MM-DD');
            let diaSemana = moment(diaMoment).day();
            if(ehDiaDeSemana(diaSemana)){
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

            if(ehDiaDeSemana(diaSemana)){
                inicioFerias = inicioFerias.format('DD/MM/YYYY')

                let qtdDiasExtras = calcularQtdDias(el.data)
                let totalDias = +qtdDias + +qtdDiasExtras;
                var voltaFerias = diaMoment.add(totalDias, 'days');
                let diaSemanaFim = diaSemanaToText(moment(voltaFerias).day());

                voltaFerias = voltaFerias.format('DD/MM/YYYY')

                let objDia = {qtdDias: totalDias, feriado: el.feriado,
                     diaInicio: inicioFerias, diaSemanaInicio: diaSemanaToText(diaSemana),
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

    validarDatas(dataInicio: string, dataFim: string){
        return moment(dataInicio).isSameOrBefore(dataFim)
    }
}

function calcularQtdDias(diaFeriado: any) :Number{
    var diaSemana = moment(diaFeriado).day()

    if(diaSemana == 5){
        return 3
    }

    return 1
}

function diaSemanaToText(diaSemana: number) :string{
    const nomesDiasDaSemana = ['Domingo', 'Segunda',
     'Terça','Quarta', 'Quinta', 'Sexta', 'Sábado']
    return nomesDiasDaSemana[diaSemana]
}

function ehDiaDeSemana(diaSemana:number) {
    return diaSemana > 0 && diaSemana < 6
}

