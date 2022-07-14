import fetch from 'node-fetch'
import moment, { Moment } from 'moment'
import 'dotenv/config';

const TOKEN = process.env.TOKEN;

interface FeriadoObj {
    date: string;
    name: string;
    type: string;
    level: string;
}

export class GetFeriadosUseCase {

    constructor(){

    }

    async gerarListaFeriado(anos: number[], estado: string): Promise<Array<FeriadoObj>> {
        var dadosAnos: FeriadoObj[]= [];

        for (const ano of anos) {
            const apiFeriados = `https://api.invertexto.com/v1/holidays/${ano}?token=${TOKEN}&state=${estado}`
            const response = await fetch(apiFeriados)
            var dadoAno = await response.json();
            dadosAnos = dadosAnos.concat(dadoAno);
        }

        return dadosAnos
        
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
                let objDia = {
                    data: diaMoment,
                    diaSemana:diaSemana, 
                    feriado: {
                        nome: el.name,
                        tipo: el.type,
                        nivel: el.level
                    }
                };
                periodo.push(objDia)
            }
        })
    
        return periodo;
    }

    calcularPerido(periodoDiaSemana:Array<Object>, qtdDias:Number, feriadosFiltrados:Array<Object>) {
    
        var periodoIdeal:Array<Object> = [];
    
        periodoDiaSemana.forEach((el: any) => {
            const diaMoment = el.data.clone() //dia do feriado
            var inicioFerias = diaMoment.subtract(qtdDias, 'days');
            let diaSemana = moment(inicioFerias).day();

            if(ehDiaDeSemana(diaSemana)){
                let diasExtrasFeriado = 0;
                if(ehFeriado(inicioFerias, feriadosFiltrados)){
                    console.log('eh feriado')
                    console.log('diaSemana:', diaSemanaToText(diaSemana))
                    diaSemana == 1 ? diasExtrasFeriado = 3 : diasExtrasFeriado = 1; 
                }
                
                inicioFerias = inicioFerias.format('DD/MM/YYYY')

                let qtdDiasExtras = calcularQtdDias(el.data)
                let totalDias = +qtdDias + +qtdDiasExtras + diasExtrasFeriado;
                var voltaFerias = diaMoment.add(totalDias, 'days');
                let diaSemanaFim = diaSemanaToText(moment(voltaFerias).day());

                voltaFerias = voltaFerias.format('DD/MM/YYYY')

                let objDia = {
                    qtdDias: totalDias, 
                    diaInicio: inicioFerias, diaSemanaInicio: diaSemanaToText(diaSemana),
                    diaFim: voltaFerias, diaSemanaFim,
                    feriado: el.feriado
                };

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
function ehFeriado(inicioFerias: Moment, feriadosFiltrados: Array<Object>) {
    const dataFormatada = inicioFerias.format('YYYY-MM-DD')
    return feriadosFiltrados.find((el) => {
        return el.date == dataFormatada
    })
}

