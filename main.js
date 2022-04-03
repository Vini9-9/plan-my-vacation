const apiEstados = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/"

async function loadData() {
    const resEstados = await fetch(apiEstados).then((data) => data.json())
    listStates(resEstados)

    $("select[name='estado']").change(async function () {
        var estadoSelecionado = $(this).find("option:selected").attr('data-id')

        if (estadoSelecionado) {
            
            var listaCidades = await listCities(estadoSelecionado)
            generateOptionCities(listaCidades)

        } else {
 
            $("select[name='cidade']").html('<option value="">–  –</option>');
 
        }
    });

}

loadData()

function listStates(json) {
    var options = '<option value="">–  –</option>';

    for (var i = 0; i < json.length; i++) {

        options += `<option data-id="${json[i].id}" value="${json[i].nome}" > ${json[i].nome} </option>`;

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