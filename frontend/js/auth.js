/**
 * auth.js — Módulo central de autenticação Firebase + NestJS
 *
 * Filosofia de armazenamento:
 *  - JWT do sistema → sessionStorage APENAS (nunca localStorage)
 *  - Dados do usuário → SEMPRE vindos do servidor via GET /auth/me
 *  - Nenhum dado de role, email, nome ou photo no localStorage
 *
 * Para encerrar todas as sessões, o backend deve manter uma blacklist de JWTs
 * (Redis ou coluna revogado_em na tabela de sessões). O logout local sempre
 * limpa o sessionStorage e desautentica do Firebase.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  API_BASE,
  FIREBASE_CONFIG,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_REDIRECT_URI,
  LINKEDIN_SCOPE,
} from "./config.js";

// ── Inicialização Firebase ────────────────────────────────────────────────────
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

// ── Chave única do JWT na sessionStorage ─────────────────────────────────────
const JWT_KEY = "esg_jwt";

// ── Helpers de token ──────────────────────────────────────────────────────────

/** Decodifica o payload do JWT sem verificar assinatura (uso apenas no cliente). */
function _parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch (_) {
    return {};
  }
}

function _salvarToken(token) {
  try {
    sessionStorage.setItem(JWT_KEY, token);
  } catch (_) {}
}

export function getToken() {
  try {
    return sessionStorage.getItem(JWT_KEY);
  } catch (_) {
    return null;
  }
}

/** Retorna o payload decodificado do JWT atual, ou null se não logado. */
export function getTokenPayload() {
  const token = getToken();
  if (!token) return null;
  const payload = _parseJwt(token);
  // Valida expiração client-side (proteção básica; o servidor valida de verdade)
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    _limparToken();
    return null;
  }
  return payload;
}

/** Role do usuário logado: "admin" | "user" | null */
export function getUserRole() {
  return getTokenPayload()?.role ?? null;
}

/** Verifica se o usuário está logado (JWT válido na sessão). */
export function isLoggedIn() {
  return getTokenPayload() !== null;
}

function _limparToken() {
  try {
    sessionStorage.removeItem(JWT_KEY);
  } catch (_) {}
}

// ── Tradução de erros Firebase ────────────────────────────────────────────────

function _mensagemErro(code) {
  const map = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca. Use ao menos 6 caracteres.",
    "auth/user-not-found": "Nenhuma conta encontrada com este e-mail.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential":
      "Credenciais inválidas. Verifique e-mail e senha.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/account-exists-with-different-credential":
      "Este e-mail já está vinculado a outro método de login.",
  };
  return map[code] || "Ocorreu um erro inesperado. Tente novamente.";
}

function _mostrarErro(msg) {
  const el = document.getElementById("auth-error");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
    el.setAttribute("role", "alert");
    return;
  }
  const toast = document.createElement("div");
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#e74c3c",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    zIndex: "9999",
    fontFamily: "'Sora', sans-serif",
    fontSize: "0.9rem",
    maxWidth: "90vw",
    textAlign: "center",
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function _esconderErro() {
  const el = document.getElementById("auth-error");
  if (el) el.style.display = "none";
}

// ══════════════════════════════════════════════════════════════════════════════
//  DADOS DO USUÁRIO — sempre do servidor, nunca do localStorage
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Busca os dados do usuário autenticado no servidor.
 * Requer JWT válido na sessionStorage.
 * Retorna { id, nome, sobrenome, email, role, criado_em } ou null.
 */
export async function fetchMe() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) _limparToken(); // token expirado
      return null;
    }
    return await res.json();
  } catch (_) {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SELEÇÃO DE TIPO — modal unificado para social login fora do register.html
// ══════════════════════════════════════════════════════════════════════════════

function _pedirTipoConta() {
  return new Promise((resolve, reject) => {
    if (typeof window.abrirModalAcesso === "function") {
      const _finalizarOriginal = window.finalizarCadastro;
      window._resolverTipo = (tipo, codigoEmpresa) => {
        window.finalizarCadastro = _finalizarOriginal;
        resolve({ tipo, codigoEmpresa });
      };
      window._modoSocialTipo = true;
      window.abrirModalAcesso();
      return;
    }
    _injetarMiniModal(resolve, reject);
  });
}

function _injetarMiniModal(resolve, reject) {
  document.getElementById("_esg-tipo-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "_esg-tipo-modal";
  overlay.innerHTML = `
    <style>
      #_esg-tipo-modal {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0,0,0,0.7); display: flex;
        align-items: center; justify-content: center;
        font-family: 'Sora', sans-serif;
      }
      ._esg-card {
        background: #0f1117; border: 1px solid rgba(255,215,0,0.2);
        border-radius: 16px; padding: 32px; max-width: 400px; width: 90%;
        color: #e8e8e8; text-align: center;
      }
      ._esg-card h3 { margin: 0 0 8px; font-size: 1.2rem; color: #ffd700; }
      ._esg-card p  { margin: 0 0 24px; font-size: 0.875rem; color: #aaa; }
      ._esg-btns    { display: flex; gap: 12px; justify-content: center; }
      ._esg-btn {
        flex: 1; padding: 12px; border-radius: 10px; border: 1px solid;
        cursor: pointer; font-family: inherit; font-size: 0.9rem;
        font-weight: 600; transition: opacity .2s;
      }
      ._esg-btn:hover { opacity: .85; }
      ._esg-btn.usuario {
        background: rgba(255,215,0,0.1); border-color: rgba(255,215,0,0.4);
        color: #ffd700;
      }
      ._esg-btn.empresa {
        background: rgba(46,204,113,0.1); border-color: rgba(46,204,113,0.4);
        color: #2ecc71;
      }
      ._esg-cancel {
        margin-top: 16px; font-size: 0.8rem; color: #666;
        cursor: pointer; text-decoration: underline; display: block;
      }
    </style>
    <div class="_esg-card">
      <h3>Tipo de conta</h3>
      <p>Como você vai usar a plataforma ENIAC ESG HUB?</p>
      <div class="_esg-btns">
        <button class="_esg-btn usuario" id="_esg-btn-user">👤 Usuário</button>
        <button class="_esg-btn empresa" id="_esg-btn-emp">🏢 Empresa</button>
      </div>
      <span class="_esg-cancel" id="_esg-cancel">Cancelar</span>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector("#_esg-btn-user").onclick = () => {
    overlay.remove();
    resolve({ tipo: "usuario" });
  };

  overlay.querySelector("#_esg-btn-emp").onclick = () => {
    overlay.remove();
    _pedirCodigoEmpresa(resolve, reject);
  };

  overlay.querySelector("#_esg-cancel").onclick = () => {
    overlay.remove();
    reject(new Error("Seleção de tipo cancelada"));
  };
}

function _pedirCodigoEmpresa(resolve, reject) {
  document.getElementById("_esg-emp-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "_esg-emp-modal";
  overlay.innerHTML = `
    <style>
      #_esg-emp-modal {
        position: fixed; inset: 0; z-index: 10001;
        background: rgba(0,0,0,0.8); display: flex;
        align-items: center; justify-content: center;
        font-family: 'Sora', sans-serif;
      }
      ._esg-emp-card {
        background: #0f1117; border: 1px solid rgba(46,204,113,0.3);
        border-radius: 16px; padding: 32px; max-width: 380px; width: 90%;
        color: #e8e8e8;
      }
      ._esg-emp-card h3 { margin: 0 0 8px; font-size: 1.1rem; color: #2ecc71; }
      ._esg-emp-card p  { margin: 0 0 16px; font-size: 0.85rem; color: #aaa; }
      ._esg-emp-input {
        width: 100%; box-sizing: border-box; padding: 12px 14px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px; color: #e8e8e8; font-size: 0.95rem;
        font-family: inherit; margin-bottom: 16px; outline: none;
      }
      ._esg-emp-input:focus { border-color: rgba(46,204,113,0.5); }
      ._esg-emp-confirm {
        width: 100%; padding: 12px; border-radius: 10px;
        background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.4);
        color: #2ecc71; font-family: inherit; font-size: 0.95rem;
        font-weight: 600; cursor: pointer;
      }
      ._esg-emp-err { color: #e74c3c; font-size: 0.82rem; margin-bottom: 10px; display: none; }
      ._esg-cancel2 {
        display: block; margin-top: 12px; text-align: center;
        font-size: 0.8rem; color: #666; cursor: pointer; text-decoration: underline;
      }
    </style>
    <div class="_esg-emp-card">
      <h3>🏢 Acesso Empresa</h3>
      <p>Insira o código corporativo fornecido pela ENIAC.</p>
      <input class="_esg-emp-input" id="_esg-emp-code" type="password" placeholder="Código de acesso" />
      <div class="_esg-emp-err" id="_esg-emp-err">Código inválido ou em branco.</div>
      <button class="_esg-emp-confirm" id="_esg-emp-ok">Confirmar acesso</button>
      <span class="_esg-cancel2" id="_esg-cancel2">Voltar</span>
    </div>`;

  document.body.appendChild(overlay);

  const input = overlay.querySelector("#_esg-emp-code");
  input.focus();

  const confirm = () => {
    const code = input.value.trim();
    if (!code) {
      overlay.querySelector("#_esg-emp-err").style.display = "block";
      return;
    }
    overlay.remove();
    resolve({ tipo: "empresa", codigoEmpresa: code });
  };

  overlay.querySelector("#_esg-emp-ok").onclick = confirm;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirm();
  });

  overlay.querySelector("#_esg-cancel2").onclick = () => {
    overlay.remove();
    reject(new Error("Seleção de tipo cancelada"));
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  REGISTRO (email + senha)
// ══════════════════════════════════════════════════════════════════════════════

export async function handleRegister({
  nome,
  sobrenome,
  email,
  senha,
  tipo = "usuario",
  codigoEmpresa,
}) {
  _esconderErro();

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, senha);
  } catch (err) {
    _mostrarErro(_mensagemErro(err.code));
    throw err;
  }

  await updateProfile(credential.user, {
    displayName: `${nome} ${sobrenome}`,
  });

  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      nome,
      sobrenome,
      email,
      senha,
      tipo,
      codigoEmpresa,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    await credential.user.delete().catch(() => {});
    _mostrarErro(body.message || "Erro ao salvar conta. Tente novamente.");
    throw new Error(body.message);
  }

  await _loginNestJS(email, senha);
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN (email + senha)
// ══════════════════════════════════════════════════════════════════════════════

export async function handleLogin(email, senha) {
  _esconderErro();

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (err) {
    _mostrarErro(_mensagemErro(err.code));
    throw err;
  }

  return await _loginNestJS(email, senha);
}

async function _loginNestJS(email, senha) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      res.status === 401
        ? "Conta não encontrada no sistema. Tente criar uma nova conta."
        : body.message || "Credenciais inválidas.";
    _mostrarErro(msg);
    throw new Error(msg);
  }

  const { accessToken } = await res.json();
  _salvarToken(accessToken);
  return { accessToken };
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN SOCIAL — Google
// ══════════════════════════════════════════════════════════════════════════════

export async function handleGoogleLogin() {
  _esconderErro();
  const provider = new GoogleAuthProvider();
  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (err) {
    _mostrarErro(_mensagemErro(err.code));
    throw err;
  }
  return await _socialLoginNestJS(result.user, "google");
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN SOCIAL — GitHub
// ══════════════════════════════════════════════════════════════════════════════

export async function handleGithubLogin() {
  _esconderErro();
  const provider = new GithubAuthProvider();
  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (err) {
    _mostrarErro(_mensagemErro(err.code));
    throw err;
  }
  return await _socialLoginNestJS(result.user, "github");
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN SOCIAL — LinkedIn
// ══════════════════════════════════════════════════════════════════════════════

export function handleLinkedinLogin() {
  _esconderErro();

  const state = crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  try {
    sessionStorage.setItem("linkedin_oauth_state", state);
  } catch (_) {}

  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    state,
    scope: LINKEDIN_SCOPE,
  });

  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export async function finalizarLinkedinLogin(code, state) {
  let savedState;
  try {
    savedState = sessionStorage.getItem("linkedin_oauth_state");
  } catch (_) {}

  if (!savedState || savedState !== state) {
    _mostrarErro("Falha de segurança no login com LinkedIn. Tente novamente.");
    throw new Error("LinkedIn state mismatch");
  }

  try {
    sessionStorage.removeItem("linkedin_oauth_state");
  } catch (_) {}

  const res = await fetch(`${API_BASE}/auth/linkedin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri: LINKEDIN_REDIRECT_URI }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    _mostrarErro(body.message || "Erro ao autenticar com LinkedIn.");
    throw new Error(body.message);
  }

  const { accessToken } = await res.json();
  _salvarToken(accessToken);
  return { accessToken };
}

// ── Helper: envia idToken Firebase ao NestJS /auth/social ────────────────────

async function _socialLoginNestJS(firebaseUser, provider) {
  const idToken = await firebaseUser.getIdToken();

  const res = await fetch(`${API_BASE}/auth/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ provider }),
  });

  if (res.ok) {
    const { accessToken } = await res.json();
    _salvarToken(accessToken);
    return { accessToken };
  }

  if (res.status === 404 || res.status === 400) {
    let tipoInfo;
    try {
      tipoInfo = await _pedirTipoConta();
    } catch (_) {
      await signOut(auth).catch(() => {});
      throw new Error("Login cancelado");
    }

    const res2 = await fetch(`${API_BASE}/auth/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        provider,
        tipo: tipoInfo.tipo,
        codigoEmpresa: tipoInfo.codigoEmpresa,
      }),
    });

    if (res2.ok) {
      const { accessToken } = await res2.json();
      _salvarToken(accessToken);
      return { accessToken };
    }

    const body2 = await res2.json().catch(() => ({}));
    _mostrarErro(body2.message || `Erro ao autenticar com ${provider}.`);
    throw new Error(body2.message);
  }

  const body = await res.json().catch(() => ({}));
  const providerName =
    { google: "Google", github: "GitHub" }[provider] || provider;
  _mostrarErro(body.message || `Erro ao autenticar com ${providerName}.`);
  throw new Error(body.message);
}

// ══════════════════════════════════════════════════════════════════════════════
//  TROCA DE SENHA (autenticado)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Reautentica o usuário no Firebase com a senha atual, depois atualiza.
 * Também notifica o backend para registrar a mudança (PATCH /users/me/password).
 */
export async function handleChangePassword(senhaAtual, novaSenha) {
  const user = auth.currentUser;
  if (!user || !user.email)
    throw new Error("Usuário não autenticado no Firebase.");

  // Reautentica para confirmar identidade
  const credential = EmailAuthProvider.credential(user.email, senhaAtual);
  try {
    await reauthenticateWithCredential(user, credential);
  } catch (err) {
    if (
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential"
    ) {
      throw new Error("Senha atual incorreta.");
    }
    throw new Error(_mensagemErro(err.code));
  }

  // Atualiza no Firebase
  await updatePassword(user, novaSenha);

  // Notifica o backend (para atualizar scrypt no banco + revogar sessões antigas)
  const token = getToken();
  if (token) {
    await fetch(`${API_BASE}/users/me/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    }).catch(() => {}); // Não bloqueia se o backend falhar
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ATUALIZAÇÃO DE DADOS PESSOAIS
// ══════════════════════════════════════════════════════════════════════════════

export async function handleUpdateProfile(dados) {
  const token = getToken();
  if (!token) throw new Error("Não autenticado.");

  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao atualizar perfil.");
  }

  return await res.json();
}

// ══════════════════════════════════════════════════════════════════════════════
//  PREFERÊNCIAS
// ══════════════════════════════════════════════════════════════════════════════

export async function handleUpdatePreference(key, value) {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_BASE}/users/me/preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ [key]: value }),
  }).catch(() => {});
}

// ══════════════════════════════════════════════════════════════════════════════
//  SESSÕES — encerrar outras sessões
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Encerra todas as outras sessões do usuário.
 * O backend deve manter uma tabela de sessões ou incrementar um campo
 * session_version no usuário — qualquer JWT com versão anterior é rejeitado.
 */
export async function handleRevokeOtherSessions() {
  const token = getToken();
  if (!token) throw new Error("Não autenticado.");

  const res = await fetch(`${API_BASE}/auth/sessions/revoke-others`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Erro ao encerrar sessões.");
  }

  return await res.json();
}

// ══════════════════════════════════════════════════════════════════════════════
//  RECUPERAÇÃO DE SENHA
// ══════════════════════════════════════════════════════════════════════════════

export async function handleForgot(email) {
  _esconderErro();
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${location.origin}/pages/login.html`,
    });
  } catch (err) {
    if (err.code !== "auth/user-not-found") {
      _mostrarErro(_mensagemErro(err.code));
      throw err;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGOUT — encerra sessão local E notifica o servidor
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @param {boolean} [todasSessoes=false] - Se true, revoga o JWT no servidor
 *   (requer endpoint DELETE /auth/sessions no backend).
 *   Se false, apenas limpa a sessão local.
 */
export async function handleLogout(todasSessoes = false) {
  const token = getToken();

  // 1. Notifica o servidor para invalidar o JWT (blacklist/revogação)
  if (token) {
    const endpoint = todasSessoes ? "/auth/sessions" : "/auth/sessions/current";
    await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {}); // Falha silenciosa — o JWT expirará naturalmente
  }

  // 2. Limpa sessão local
  _limparToken();

  // 3. Desautentica do Firebase
  await signOut(auth).catch(() => {});

  // 4. Redireciona para login
  window.location.href = "/pages/login.html";
}

// ══════════════════════════════════════════════════════════════════════════════
//  OBSERVADOR DE SESSÃO FIREBASE
// ══════════════════════════════════════════════════════════════════════════════

export function onSession(callback) {
  return onAuthStateChanged(auth, callback);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERSÃO DE CONTA ANÔNIMA → REAL
// ══════════════════════════════════════════════════════════════════════════════

export async function handleConvertAnonymous(dados) {
  const { email, senha } = dados;

  const { linkWithCredential } =
    await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.isAnonymous) {
    return handleRegister(dados);
  }

  const credential = EmailAuthProvider.credential(email, senha);
  try {
    await linkWithCredential(currentUser, credential);
  } catch (err) {
    _mostrarErro(_mensagemErro(err.code));
    throw err;
  }

  const { nome, sobrenome } = dados;
  await updateProfile(currentUser, { displayName: `${nome} ${sobrenome}` });

  const idToken = await currentUser.getIdToken(true);
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    _mostrarErro(body.message || "Erro ao converter conta.");
    throw new Error(body.message);
  }

  await _loginNestJS(email, senha);
}
