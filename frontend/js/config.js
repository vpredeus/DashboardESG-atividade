/**
 * config.js — Configurações do frontend (substitui dotenv, que é Node.js-only)
 *
 * IMPORTANTE: Este arquivo é carregado pelo browser — NUNCA coloque aqui
 * segredos como FIREBASE_PRIVATE_KEY ou LINKEDIN_CLIENT_SECRET.
 * Esses valores ficam APENAS no .env do backend NestJS.
 *
 * Como usar em outro módulo:
 *   import { API_BASE, FIREBASE_CONFIG, LINKEDIN_CLIENT_ID } from './config.js';
 */

// ── URL base da API NestJS ────────────────────────────────────────────────────
// Detecta automaticamente: dev (Live Server :5500) → localhost:3000
//                          produção → URL do Render
export const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://dashboardesg-atividade.onrender.com";

// ── Firebase (público — estas chaves podem ficar no frontend) ─────────────────
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyANdJd1Y8T7MGzazUz2-I7CS2IzHgyvz08",
  authDomain: "dashboard-esg-3aaff.firebaseapp.com",
  projectId: "dashboard-esg-3aaff",
  storageBucket: "dashboard-esg-3aaff.firebasestorage.app",
  messagingSenderId: "135866671836",
  appId: "1:135866671836:web:f14e7aadef2e433760ca19",
  measurementId: "G-6CSNZSP5NN",
};

// ── LinkedIn OAuth (client_id é público; client_secret fica só no backend) ────
export const LINKEDIN_CLIENT_ID = "77cy3te6140r7e"; // do .env LINKEDIN_CLIENT_ID
export const LINKEDIN_REDIRECT_URI = `${location.origin}/html/linkedin-callback.html`;
// https://www.linkedin.com/developers/tools/oauth/redirect

export const LINKEDIN_SCOPE = "openid profile email";
