# 🌱 Dashboard de Impacto ESG

## 📖 Sobre o Projeto
Este projeto foi desenvolvido como parte de uma atividade do **curso técnico de Informática**, com o objetivo de compreender como dados são **estruturados, transmitidos e visualizados em sistemas modernos**.

A aplicação consiste em um **painel de monitoramento de impacto ESG**, onde dados sobre projetos sociais e ambientais são armazenados em formato **JSON**, disponibilizados por meio de uma **API**, e posteriormente exibidos em um **dashboard com gráfico** para facilitar a visualização do impacto de cada projeto.

Esse tipo de solução é comum em **relatórios de sustentabilidade, dashboards corporativos e plataformas de monitoramento de impacto social**.

---

## 🎯 Objetivos da Atividade

Ao final do desenvolvimento, espera-se compreender:

- O que é um **arquivo JSON** e como ele organiza dados;
- O papel de uma **API** em um sistema;
- Como uma aplicação pode **buscar dados de uma API**;
- Como **visualizar dados em gráficos** dentro de um dashboard.

---

## 🧩 Funcionamento do Sistema

O sistema será composto por três partes principais:

### 📂 Base de Dados (JSON)

Um arquivo **JSON** funciona como um pequeno banco de dados contendo informações sobre projetos ESG, como:

- Hortas comunitárias
- Programas de capacitação profissional
- Iniciativas de reciclagem
- Projetos de inclusão digital

Cada projeto possui um **indicador de impacto**, representando a quantidade de pessoas beneficiadas ou ações realizadas.

---

### 🔌 API

Uma **API simples** será responsável por:

- Ler os dados do arquivo JSON
- Disponibilizar essas informações para outras aplicações

---

### 📊 Dashboard

Uma aplicação web irá:

- Consumir os dados da API
- Processar as informações
- Exibir um **gráfico comparativo** mostrando o impacto de cada projeto

Isso permitirá identificar **quais projetos geraram maior impacto social ou ambiental**.

---

## ⚙️ Tecnologias Utilizadas

- JavaScript
- HTML
- CSS

---

## 🚀 Funcionalidades

- Armazenamento de dados em **JSON**
- API para fornecimento de dados
- Consumo da API por uma aplicação web
- Visualização de dados em **gráfico de impacto ESG**
- Comparação entre projetos sociais

---

## ⚙️ Como Rodar o Projeto

Para executar o projeto, é necessário abrir **dois terminais**: um para a API e outro para o Frontend.

### 1️⃣ Rodando a API (NestJS)

No terminal, acesse a pasta da API:
Instale a dependência

```bash
npm install
```
Execute a API em modo de desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em http://localhost:3000 (ou outra porta configurada no projeto).

### 2️⃣ Rodando o Frontend

No outro terminal, acesse a pasta do frontend:

Inicie o servidor local com o serve:

```bash
npx serve .
```
Após isso, abra o navegador e acesse o endereço mostrado pelo terminal para visualizar o dashboard.

---

## 📈 Resultado Esperado

Ao final do projeto, o sistema deverá apresentar um **gráfico visual** mostrando o impacto gerado pelos projetos ESG.

Cada projeto aparecerá como um elemento no gráfico, permitindo observar facilmente a diferença entre os níveis de impacto.

---

## 👨‍💻 Equipe

Projeto desenvolvido por:

Frontend
- Ana Paula (@Itsanapaula) 
- Enzo Dutra (@Enzo-Dutra)
- Rafael Brito (@Rafa-A-Brito)
- Arthur Augusto (@ArthurBigodeAug)

API:
- Fernando (@F3rCar)
- Nicolas (@Fladenz)
- Henrique (@Gimenes77)

Github: 
- Eduardo Vilaronga (@vilarongadiaseduardo-glitch)
- João Victor Predeus (@vpredeus)

Admin: 
- Luiz Gustavo (@luiz030609)

---

## 📚 Contexto Acadêmico

Este projeto foi desenvolvido como **atividade prática** para compreender conceitos fundamentais de:

- Estruturação de dados
- Comunicação entre sistemas
- Consumo de APIs
- Visualização de dados
