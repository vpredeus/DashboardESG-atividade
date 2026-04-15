/**
 * config.template.js — Template de configuração do frontend
 *
 * ⚠️  NÃO edite este arquivo com valores reais.
 *     Os placeholders %%VAR%% são substituídos pelo script
 *     scripts/build-config.js durante o build na Vercel.
 *
 * Para desenvolvimento local, crie um arquivo .env na raiz
 * e rode: node scripts/build-config.js
 * Ou defina as variáveis inline:
 *   FIREBASE_API_KEY=xxx node scripts/build-config.js
 *
 * Este arquivo PODE ser commitado no GitHub sem risco.
 */

// ── URL base da API NestJS ────────────────────────────────────────────────────
export const API_BASE = "%%API_BASE%%";

// ── Firebase (chaves públicas — geradas pelo build) ───────────────────────────
export const FIREBASE_CONFIG = {
  apiKey: "%%FIREBASE_API_KEY%%",
  authDomain: "%%FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%FIREBASE_PROJECT_ID%%",
  storageBucket: "%%FIREBASE_STORAGE_BUCKET%%",
  messagingSenderId: "%%FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%FIREBASE_APP_ID%%",
  measurementId: "%%FIREBASE_MEASUREMENT_ID%%",
};

// ── LinkedIn OAuth (client_id é público; client_secret fica só no backend) ────
export const LINKEDIN_CLIENT_ID = "%%LINKEDIN_CLIENT_ID%%";
export const LINKEDIN_REDIRECT_URI = `${location.origin}/html/linkedin-callback.html`;
export const LINKEDIN_SCOPE = "openid profile email";
