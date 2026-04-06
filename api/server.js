import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const porta = 5000;

app.use(express.json());
app.use(cors({ origin: "*" }));

const caminhoProjetos = path.resolve("../data/projetos.json");
const caminhoIndicadores = path.resolve("data/dados.json");

app.get("/projetos", (req, res) => {
  try {
    const dados = fs.readFileSync(caminhoProjetos, "utf-8");
    res.json(JSON.parse(dados));
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao ler projetos" });
  }
});

app.get("/indicadores", (req, res) => {
  try {
    const dados = fs.readFileSync(caminhoIndicadores, "utf-8");
    res.json(JSON.parse(dados));
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao ler indicadores" });
  }
});

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});