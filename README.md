# Plan my vacation 
Sistema de listagem de períodos ideias para tirar férias do trabalho.

## Requisitos:
* Gerar seu token de feriados na [invertexto.com](https://api.invertexto.com/api-feriados)
* [Docker](https://docs.docker.com/get-docker/)
* [Docker compose](https://docs.docker.com/compose/install/)

## Como rodar:
* Renomear o arquivo `.env.example` para `.env`;
* Associar seu token a chave TOKEN nesse mesmo arquivo; 
* Verificar que o Docker está rodando; 
* Acessar a raiz do projeto;
* Rodar o comando `docker-compose up --build` no terminal;
* acessar a url `localhost:81`;

## Funcionalidades

* Calcula a quantidade de dias sem trabalho
* Informa o tipo de feriado (facultativo / nacional / estadual)
* Lista os períodos ideias de acordo com a quantidade de dias, período informado e estado (futuramente terá para municipais).
* Integração com API de feriados nacionais e estaduais.
* Integração com API de feriados municipais (em breve!)