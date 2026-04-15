/**
 * auth.js — Módulo central de autenticação Firebase + NestJS
 *
 * CORREÇÕES v2:
 *  - Social login agora solicita tipo (usuário/empresa) antes de registrar
 *    conta nova no NestJS, via Promise resolvida pelo modal do register.html
 *    ou pelo mini-modal injetado nas demais páginas.
 *  - _loginNestJS agora trata explicitamente o 401 com mensagem clara.
 *  - handleRegister não é mais exposto no window — o form usa handleRegisterForm.
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
    sessionStorage.setItem("esg_jwt", token);
  } catch (_) {}

  // Persiste dados do usuário no localStorage para acesso entre páginas
  const payload = _parseJwt(token);
  try {
    if (payload.role) localStorage.setItem("esg_user_role", payload.role);
    if (payload.email) localStorage.setItem("esg_user_email", payload.email);
    if (payload.sub) localStorage.setItem("esg_user_id", String(payload.sub));
    localStorage.setItem("esg_user_logged", "true");
  } catch (_) {}
}

/** Salva nome e foto vindos do Firebase (login social). */
export function salvarDadosSocial(firebaseUser) {
  try {
    if (firebaseUser.displayName)
      localStorage.setItem("esg_user_nome", firebaseUser.displayName);
    if (firebaseUser.photoURL)
      localStorage.setItem("esg_user_photo", firebaseUser.photoURL);
  } catch (_) {}
}

export function getToken() {
  try {
    return sessionStorage.getItem("esg_jwt");
  } catch (_) {
    return null;
  }
}

/** Role do usuário logado: "admin" | "user" | null */
export function getUserRole() {
  try {
    return localStorage.getItem("esg_user_role");
  } catch (_) {
    return null;
  }
}

function _limparToken() {
  try {
    sessionStorage.removeItem("esg_jwt");
  } catch (_) {}
  try {
    [
      "esg_user_logged",
      "esg_user_role",
      "esg_user_email",
      "esg_user_id",
      "esg_user_nome",
      "esg_user_photo",
    ].forEach((k) => localStorage.removeItem(k));
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
//  SELEÇÃO DE TIPO — modal unificado para social login fora do register.html
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna uma Promise<{ tipo, codigoEmpresa? }> resolvida quando o usuário
 * escolhe o tipo de conta.
 *
 * Se a página já tiver `window.abrirModalAcesso` (register.html), reutiliza
 * o modal existente. Caso contrário injeta um mini-modal simples (login.html
 * ou qualquer outra página).
 */
function _pedirTipoConta() {
  return new Promise((resolve, reject) => {
    // register.html expõe abrirModalAcesso — reutiliza o modal rico
    if (typeof window.abrirModalAcesso === "function") {
      // Sobrescreve finalizarCadastro temporariamente para capturar a escolha
      const _finalizarOriginal = window.finalizarCadastro;
      window._resolverTipo = (tipo, codigoEmpresa) => {
        window.finalizarCadastro = _finalizarOriginal;
        resolve({ tipo, codigoEmpresa });
      };
      // Abre o modal; o botão "Continuar" chama window._resolverTipo
      window._modoSocialTipo = true;
      window.abrirModalAcesso();
      return;
    }

    // Outras páginas — injeta mini-modal
    _injetarMiniModal(resolve, reject);
  });
}

function _injetarMiniModal(resolve, reject) {
  // Evita duplicatas
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
    // Pede o código corporativo
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

/**
 * POST /auth/login no NestJS.
 * CORREÇÃO: mensagem de erro diferenciada para 401 (conta não sincronizada).
 */
async function _loginNestJS(email, senha) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // 401 pode significar conta Firebase existe mas não está no banco Prisma
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

/**
 * Login/registro com Google.
 * Se for conta nova no NestJS, solicita tipo de conta antes de registrar.
 */
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

  salvarDadosSocial(result.user);
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

  salvarDadosSocial(result.user);
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
// CORREÇÃO: verifica se é conta nova no NestJS e pede tipo antes de registrar.

async function _socialLoginNestJS(firebaseUser, provider) {
  const idToken = await firebaseUser.getIdToken();

  // Primeira tentativa — se o usuário já existe no NestJS, retorna JWT direto
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

  // Se o backend sinalizar que precisa de tipo (404 = usuário não existe ainda
  // no Prisma mas existe no Firebase), pede tipo e re-envia.
  // O auth.service.ts atual cria automaticamente com role "user" — mas para
  // suportar tipo empresa via social, interceptamos aqui.
  if (res.status === 404 || res.status === 400) {
    let tipoInfo;
    try {
      tipoInfo = await _pedirTipoConta();
    } catch (_) {
      // Usuário cancelou — faz logout do Firebase para não deixar sessão órfã
      await signOut(auth).catch(() => {});
      throw new Error("Login cancelado");
    }

    // Re-envia com tipo no body
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
//  LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

export async function handleLogout() {
  _limparToken();
  await signOut(auth).catch(() => {});
  window.location.href = "/pages/login.html";
}

// ══════════════════════════════════════════════════════════════════════════════
//  OBSERVADOR DE SESSÃO
// ══════════════════════════════════════════════════════════════════════════════

export function onSession(callback) {
  return onAuthStateChanged(auth, callback);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVERSÃO DE CONTA ANÔNIMA → REAL
// ══════════════════════════════════════════════════════════════════════════════

export async function handleConvertAnonymous(dados) {
  const { email, senha } = dados;

  const { EmailAuthProvider, linkWithCredential } =
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
