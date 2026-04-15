/**
 * scripts/build-config.js
 * Roda em tempo de build (Node.js) para gerar js/config.js
 * substituindo placeholders pelas variáveis de ambiente da Vercel.
 *
 * Uso local:
 *   API_BASE=http://localhost:3000 node scripts/build-config.js
 *
 * Na Vercel, este script é executado automaticamente via buildCommand no vercel.json.
 */

const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "../js/config.template.js");
const outputPath = path.join(__dirname, "../js/config.js");

if (!fs.existsSync(templatePath)) {
  console.error("❌ js/config.template.js não encontrado.");
  process.exit(1);
}

let template = fs.readFileSync(templatePath, "utf8");

const replacements = {
  "%%API_BASE%%": process.env.API_BASE || "http://localhost:3000",
  "%%FIREBASE_API_KEY%%": process.env.FIREBASE_API_KEY || "",
  "%%FIREBASE_AUTH_DOMAIN%%": process.env.FIREBASE_AUTH_DOMAIN || "",
  "%%FIREBASE_PROJECT_ID%%": process.env.FIREBASE_PROJECT_ID || "",
  "%%FIREBASE_STORAGE_BUCKET%%": process.env.FIREBASE_STORAGE_BUCKET || "",
  "%%FIREBASE_MESSAGING_SENDER_ID%%":
    process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  "%%FIREBASE_APP_ID%%": process.env.FIREBASE_APP_ID || "",
  "%%FIREBASE_MEASUREMENT_ID%%": process.env.FIREBASE_MEASUREMENT_ID || "",
  "%%LINKEDIN_CLIENT_ID%%": process.env.LINKEDIN_CLIENT_ID || "",
};

Object.entries(replacements).forEach(([placeholder, value]) => {
  if (!value) {
    console.warn(`⚠️  Variável para ${placeholder} está vazia.`);
  }
  template = template.replaceAll(placeholder, value);
});

// Garante que o diretório js/ existe
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, template, "utf8");

console.log("✅ js/config.js gerado com sucesso.");
