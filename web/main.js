const apiEstados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/"

async function loadData() {
    const resEstados = await fetch(apiEstados).then((data) => data.json())
    listStates(resEstados)

/*     $("select[name='estado']").change(async function () {
        var estadoSelecionado = $(this).find("option:selected").attr('data-id')

        if (estadoSelecionado) {
            
            var listaCidades = await listCities(estadoSelecionado)
            generateOptionCities(listaCidades)

        } else {
 
            $("select[name='cidade']").html('<option value="">–  –</option>');
 
        }
    }); */

}

loadData()

function listStates(json) {
    var options = '<option value="">–  –</option>';

    for (var i = 0; i < json.length; i++) {

        options += `<option data-id="${json[i].id}" value="${json[i].sigla}" > ${json[i].nome} </option>`;

    }

    $("select[name='estado']").html(options);
 
}

async function listCities(estadoSelecionado) {

    if(estadoSelecionado){
        var apiCidades =  apiEstados + estadoSelecionado + '/municipios'
        const resApiCidades = await fetch(apiCidades).then((data) => data.json())
        return resApiCidades
    }

    return false
    
}

function generateOptionCities(dadosCidades) {

    var options = '<option value="">–  –</option>';

    for (var i = 0; i < dadosCidades.length; i++) {

        options += `<option value="${dadosCidades[i].nome}" >${dadosCidades[i].nome} </option>`;

    }

    $("select[name='cidade']").html(options);

};


function generateSuggestedPeriods(resultJSON) {

    var resultTable = '';

    for (var i = 0; i < resultJSON.length; i++) {

        dadosFeriado = resultJSON[i].feriado
        
        let qtdDias = `<th scope="row"> ${resultJSON[i].qtdDias} </th>`;
        let nomeFeriado = `<td> ${dadosFeriado.nome} </td>`;
        let tipoFeriado = `<td> ${dadosFeriado.tipo} (${dadosFeriado.nivel}) </td>`;
        let diaInicio = `<td> ${resultJSON[i].diaInicio} (${resultJSON[i].diaSemanaInicio})</td>`;
        let diaFim = `<td scope="row"> ${resultJSON[i].diaFim} (${resultJSON[i].diaSemanaFim})</td>`;
        let tableRow =`
        <tr class=${dadosFeriado.tipo == 'facultativo' ? 'table-warning' : ''}> 
            ${qtdDias}  
            ${nomeFeriado}  
            ${tipoFeriado}  
            ${diaInicio}  
            ${diaFim}  
        </tr>`;

        resultTable += tableRow;
    }

    $("#resultados").html(resultTable);

};

function generateNoResults() {
    $("#resultados").html(`<b>Nenhum resultado encontrado :(</b>`);
}

function enviarDados() {

    const qtdDias = $("#qtd-dias").val()
    const dataInicio = $("#data-inicio").val()
    const dataFim = $("#data-fim").val()
    const estado = $("#estado-sigla").val()
    //const cidade = $("#cidade-nome").val()

    const dadosJson =  {
        "qtdDias": qtdDias,
        "dataInicio": dataInicio,
        "dataFim": dataFim,
        "estado" : estado,
        //"cidade": cidade
    }

    dataJson = JSON.stringify(dadosJson)
    console.log(dataJson)

    const xhr = new XMLHttpRequest()

    xhr.open("POST", "https://api-plan-my-vacation.herokuapp.com/feriados")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(dataJson)
    xhr.onload = function () {
        var resultJSON = JSON.parse(this.responseText)
        document.getElementById('sigla-estado').innerHTML = estado
        resultJSON.periodosIdeias.length ? generateSuggestedPeriods(resultJSON.periodosIdeias) : generateNoResults()
    }

}