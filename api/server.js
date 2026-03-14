import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

const porta = 5000;

const router = express.Router()
//pode continuar aqui, ou criar outros arquivos pro que falta
//a função que lê arquivos json é fs.readFileSync, da uma pesquisada dps e se precisar de ajuma me manda mensagem(Fernando)

app.listen(porta, () => {
    console.log("Rodando na porta 5000");
});