// ── Paleta ────────────────────────────────────────────────────────
const CHART_COLORS = [
  "#ffd700",
  "#2ecc71",
  "#3498db",
  "#e74c3c",
  "#9b59b6",
  "#e67e22",
  "#1abc9c",
  "#16a085",
  "#f39c12",
  "#27ae60",
  "#8e44ad",
  "#2980b9",
  "#f1c40f",
  "#95a5a6",
  "#e91e63",
];

const DARK = {
  text: "rgba(255,255,255,0.55)",
  textBold: "rgba(255,255,255,0.80)",
  grid: "rgba(255,255,255,0.07)",
  tooltip: {
    backgroundColor: "#141c4a",
    borderColor: "rgba(255,215,0,0.3)",
    borderWidth: 1,
    titleColor: "#ffd700",
    bodyColor: "rgba(255,255,255,0.75)",
    padding: 12,
  },
};

const EIXO_COLORS = {
  "desenvolvimento social": "#3498db",
  "meio ambiente": "#2ecc71",
  educacao: "#f39c12",
  educação: "#f39c12",
  saude: "#e74c3c",
  saúde: "#e74c3c",
  cultura: "#9b59b6",
  tecnologia: "#1abc9c",
  governanca: "#e67e22",
  governança: "#e67e22",
  diversidade: "#e91e63",
  inovacao: "#16a085",
  inovação: "#16a085",
};

function eixoColor(eixo, idx) {
  const key = (eixo || "").toLowerCase().trim();
  return EIXO_COLORS[key] || CHART_COLORS[idx % CHART_COLORS.length];
}

// ── Utilitários ───────────────────────────────────────────────────
function toggleMenu() {
  document.getElementById("menu").classList.toggle("active");
}

function exportCSV(chartId, filename) {
  const chart = Chart.getChart(chartId);
  if (!chart) return;
  const headers = [
    "Label",
    ...chart.data.datasets.map((d) => d.label || "Valor"),
  ];
  const rows = chart.data.labels.map((l, i) => [
    l,
    ...chart.data.datasets.map((d) => d.data[i]),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function numFmt(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("pt-BR");
}

function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString("pt-BR");
}

// ══════════════════════════════════════════════════════════════════
//  ARMAZENAMENTO — IndexedDB com fallback para sessionStorage
//  Resolve o limite de ~5 MB do sessionStorage para CSVs grandes
// ══════════════════════════════════════════════════════════════════

const _DB_NAME = "esg_hub";
const _DB_STORE = "dados";
const _DB_KEY = "esg_dados";

function _abrirDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB não suportado"));
      return;
    }
    const req = indexedDB.open(_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(_DB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function _salvarDados(projetos) {
  // 1) Tenta IndexedDB (sem limite prático)
  try {
    const db = await _abrirDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(_DB_STORE, "readwrite");
      tx.objectStore(_DB_STORE).put(projetos, _DB_KEY);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    return;
  } catch (_) {}
  // 2) Fallback sessionStorage (pode falhar com >500 linhas)
  try {
    sessionStorage.setItem(_DB_KEY, JSON.stringify(projetos));
  } catch (e) {
    console.warn("Armazenamento cheio:", e);
  }
}

async function _carregarDados() {
  // 1) Tenta IndexedDB
  try {
    const db = await _abrirDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(_DB_STORE, "readonly");
      const req = tx.objectStore(_DB_STORE).get(_DB_KEY);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  } catch (_) {}
  // 2) Fallback sessionStorage
  try {
    const raw = sessionStorage.getItem(_DB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

async function _limparDados() {
  try {
    const db = await _abrirDB();
    await new Promise((res) => {
      const tx = db.transaction(_DB_STORE, "readwrite");
      tx.objectStore(_DB_STORE).delete(_DB_KEY);
      tx.oncomplete = res;
    });
  } catch (_) {}
  try {
    sessionStorage.removeItem(_DB_KEY);
  } catch (_) {}
}

// ── Charts ────────────────────────────────────────────────────────
function setupCharts() {
  Chart.defaults.color = DARK.text;
  Chart.defaults.borderColor = DARK.grid;
  Chart.defaults.font.family = "'Sora','Segoe UI',sans-serif";
}

function _destroyIfExists(id) {
  const c = Chart.getChart(id);
  if (c) c.destroy();
}

function makeBar(id, labels, datasets, horizontal) {
  const el = document.getElementById(id);
  if (!el) return;
  _destroyIfExists(id);
  return new Chart(el, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        legend: { labels: { color: DARK.textBold, font: { size: 12 } } },
        tooltip: DARK.tooltip,
      },
      scales: {
        x: {
          ticks: { color: DARK.text, font: { size: 11 } },
          grid: { color: DARK.grid },
        },
        y: {
          ticks: { color: DARK.text, font: { size: 11 } },
          grid: { color: DARK.grid },
          beginAtZero: true,
        },
      },
    },
  });
}

function makeLine(id, labels, data, label) {
  const el = document.getElementById(id);
  if (!el) return;
  _destroyIfExists(id);
  return new Chart(el, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: "#ffd700",
          backgroundColor: "rgba(255,215,0,0.08)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ffd700",
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: DARK.textBold, font: { size: 12 } } },
        tooltip: DARK.tooltip,
      },
      scales: {
        x: {
          ticks: { color: DARK.text, font: { size: 11 } },
          grid: { color: DARK.grid },
        },
        y: {
          ticks: { color: DARK.text, font: { size: 11 } },
          grid: { color: DARK.grid },
          beginAtZero: true,
        },
      },
    },
  });
}

function makePie(id, labels, data, colors) {
  const el = document.getElementById(id);
  if (!el) return;
  _destroyIfExists(id);
  return new Chart(el, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: "#151b35",
          borderWidth: 3,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: DARK.textBold,
            font: { size: 12 },
            usePointStyle: true,
            padding: 14,
          },
        },
        tooltip: {
          ...DARK.tooltip,
          callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` },
        },
      },
    },
  });
}

function makeRadar(id, labels, data, label) {
  const el = document.getElementById(id);
  if (!el) return;
  _destroyIfExists(id);
  return new Chart(el, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: "rgba(52,152,219,0.18)",
          borderColor: "#3498db",
          borderWidth: 2,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#3498db",
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: DARK.tooltip },
      scales: {
        r: {
          beginAtZero: true,
          ticks: { display: false },
          grid: { color: "rgba(255,255,255,0.1)" },
          angleLines: { color: "rgba(255,255,255,0.2)" },
          pointLabels: { color: "#fff", font: { size: 12 } },
        },
      },
    },
  });
}

function makeMiniBar(canvasEl, labels, values, colors) {
  if (!canvasEl) return;
  const existing = Chart.getChart(canvasEl);
  if (existing) existing.destroy();
  return new Chart(canvasEl, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors || [
            "rgba(255,215,0,0.7)",
            "rgba(46,204,113,0.6)",
          ],
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: DARK.tooltip },
      scales: {
        x: {
          ticks: { color: DARK.text, font: { size: 9 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: DARK.text, font: { size: 9 } },
          grid: { color: DARK.grid },
          beginAtZero: true,
        },
      },
    },
  });
}

// ══════════════════════════════════════════════════════════════════
//  PARSE CSV
// ══════════════════════════════════════════════════════════════════

function _parseField(v) {
  return (v || "").replace(/^"|"$/g, "").trim();
}

function _splitLine(line, sep) {
  if (sep === ";") return line.split(";").map(_parseField);
  const result = [];
  let cur = "",
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
    } else if (c === "," && !inQ) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result.map(_parseField);
}

function _mapToESG(raw) {
  return {
    postado: raw["postado"] || raw["data/hora do envio"] || raw["data"] || "",
    tipo: raw["tipo"] || "",
    empresa: raw["empresa"] || raw["company"] || "",
    responsavel:
      raw["responsável"] || raw["responsavel"] || raw["responsible"] || "",
    email: raw["e-mail"] || raw["email"] || "",
    titulo:
      raw["título do desafio"] ||
      raw["titulo do desafio"] ||
      raw["título"] ||
      raw["titulo"] ||
      raw["name"] ||
      raw["nome"] ||
      "",
    descricaoDesafio:
      raw["descrição do desafio"] ||
      raw["descricao do desafio"] ||
      raw["description"] ||
      raw["desc"] ||
      "",
    descricao: raw["descrição"] || raw["descricao"] || "",
    areaPrimaria:
      raw["área_primária"] ||
      raw["area_primaria"] ||
      raw["área primária"] ||
      raw["area primaria"] ||
      "",
    areaSecundaria:
      raw["área_secundária"] ||
      raw["area_secundaria"] ||
      raw["área secundária"] ||
      "",
    resumo: raw["resumo"] || raw["summary"] || "",
    ods1: raw["ods_1"] || raw["ods 1"] || raw["ods1"] || "",
    ods2: raw["ods_2"] || raw["ods 2"] || raw["ods2"] || "",
    ods3: raw["ods_3"] || raw["ods 3"] || raw["ods3"] || "",
    impactoSocialDireto:
      parseInt(
        raw["impacto_social_direto_num"] || raw["impacto social direto"] || "0",
        10,
      ) || 0,
    impactoSocialIndireto:
      parseInt(
        raw["impacto_social_indireto_num"] ||
          raw["impacto social indireto"] ||
          "0",
        10,
      ) || 0,
    eixo: raw["eixo"] || "",
    natureza: raw["natureza"] || "",
  };
}

function parseCSVText(text) {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = _splitLine(lines[0], sep).map((h) => h.toLowerCase().trim());
  return lines
    .slice(1)
    .map((line) => {
      const cells = _splitLine(line, sep);
      const raw = {};
      headers.forEach((h, i) => {
        raw[h] = cells[i] || "";
      });
      return _mapToESG(raw);
    })
    .filter((p) => p.titulo || p.empresa);
}

// ══════════════════════════════════════════════════════════════════
//  UPLOAD UI (index.html)
// ══════════════════════════════════════════════════════════════════

let _csvFile = null;

const _dz = () => document.getElementById("dropZone");
const _dzIcon = () => document.getElementById("dzIcon");
const _dzTitle = () => document.getElementById("dzTitle");
const _dzSub = () => document.getElementById("dzSub");
const _dzBadge = () => document.getElementById("dzBadge");
const _fp = () => document.getElementById("filePreview");
const _fpName = () => document.getElementById("fpName");
const _fpMeta = () => document.getElementById("fpMeta");
const _pgWrap = () => document.getElementById("progressWrap");
const _pgBar = () => document.getElementById("progressBar");
const _btnG = () => document.getElementById("btnGerar");
const _btnL = () => document.getElementById("btnLimpar");
const _csvSec = () => document.getElementById("csvPreviewSection");
const _csvTbl = () => document.getElementById("csvTable");
const _csvMore = () => document.getElementById("csvPreviewMore");
const _popup = () => document.getElementById("popupOverlay");

function _fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

function closePopup() {
  _popup().classList.remove("show");
  document.getElementById("fileInput").value = "";
}

function _showPopupError(file) {
  const ext = file.name.includes(".")
    ? "." + file.name.split(".").pop().toLowerCase()
    : "(sem extensão)";
  document.getElementById("popupFileName").textContent =
    file.name.length > 32 ? file.name.substring(0, 30) + "…" : file.name;
  document.getElementById("popupExtSpan").textContent = ext;
  _popup().classList.add("show");
  _dz().classList.add("error-flash");
  setTimeout(() => _dz().classList.remove("error-flash"), 400);
}

function _simulateProgress(cb) {
  _pgWrap().classList.add("show");
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      setTimeout(cb, 200);
    }
    _pgBar().style.width = Math.min(pct, 100) + "%";
  }, 60);
}

function _renderCSVPreview(text) {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  if (!lines.length) return;
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.replace(/"/g, "").trim());
  const rows = lines.slice(1, 6);
  const total = lines.length - 1;
  let html =
    "<thead><tr>" +
    headers.map((h) => `<th>${h}</th>`).join("") +
    "</tr></thead><tbody>";
  rows.forEach((row) => {
    const cells = row.split(sep).map((c) => c.replace(/"/g, "").trim());
    html +=
      "<tr>" + cells.map((c) => `<td>${c || "—"}</td>`).join("") + "</tr>";
  });
  html += "</tbody>";
  _csvTbl().innerHTML = html;
  _csvMore().textContent =
    total > 5
      ? `+ ${total - 5} linha${total - 5 !== 1 ? "s" : ""} adicionais no arquivo`
      : `Total: ${total} linha${total !== 1 ? "s" : ""}`;
  _csvSec().classList.add("show");
}

function _processFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext !== "csv") {
    _showPopupError(file);
    return;
  }
  _csvFile = file;
  _csvSec().classList.remove("show");
  _fp().classList.remove("show");
  _btnG().disabled = true;
  _pgBar().style.width = "0%";

  _simulateProgress(() => {
    _pgWrap().classList.remove("show");
    _fpName().textContent = file.name;
    _fpMeta().textContent = `${_fmtBytes(file.size)} · ${new Date().toLocaleDateString("pt-BR")}`;
    _fp().classList.add("show");
    _dz().classList.add("has-file");
    _dzIcon().className = "fa-solid fa-file-circle-check";
    _dzTitle().textContent = "Arquivo carregado com sucesso";
    _dzSub().innerHTML =
      '<strong style="color:#2ecc71">Pronto para gerar os dashboards</strong>';
    _dzBadge().innerHTML =
      '<i class="fa-solid fa-circle-check" style="font-size:10px;margin-right:5px;color:#2ecc71"></i> CSV validado';
    _dzBadge().style.cssText =
      "background:rgba(46,204,113,0.1);border-color:rgba(46,204,113,0.3);color:#2ecc71;" +
      "display:inline-flex;align-items:center;margin-top:14px;font-size:11px;font-weight:700;" +
      "letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:50px;" +
      "border-width:1px;border-style:solid;";
    _btnG().disabled = false;
    _btnL().classList.add("show");
    const reader = new FileReader();
    reader.onload = (e) => _renderCSVPreview(e.target.result);
    reader.readAsText(file);
  });
}

async function clearUpload() {
  _csvFile = null;
  document.getElementById("fileInput").value = "";
  _fp().classList.remove("show");
  _btnG().disabled = true;
  _btnL().classList.remove("show");
  _csvSec().classList.remove("show");
  _pgWrap().classList.remove("show");
  _pgBar().style.width = "0%";
  _dz().classList.remove("has-file");
  _dzIcon().className = "fa-solid fa-file-circle-plus";
  _dzTitle().textContent = "Arraste seu arquivo aqui";
  _dzSub().innerHTML = "ou <strong>clique para selecionar</strong>";
  _dzBadge().style.cssText = "";
  _dzBadge().innerHTML =
    '<i class="fa-solid fa-lock" style="font-size:10px;margin-right:4px"></i> Apenas .csv';
  // NÃO esconde main-content nem zera os stats — os gráficos persistem
  // Só zera se não há dados anteriores
  const dadosAtuais = await _carregarDados();
  if (!dadosAtuais) {
    ["stat-total", "stat-impacto", "stat-cats"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "—";
    });
  }
}

// ── Controles do modal de upload ───────────────────────────────────

function mostrarPainelUpload() {
  const overlay = document.getElementById("uploadModalOverlay");
  if (!overlay) return;
  overlay.classList.add("show");
  // Mostra botão fechar apenas se já há dashboard renderizado
  const mc = document.getElementById("main-content");
  const closeBtn = document.getElementById("uploadModalClose");
  if (closeBtn)
    closeBtn.style.display =
      mc && mc.style.display !== "none" ? "flex" : "none";
}

function fecharPainelUpload() {
  const overlay = document.getElementById("uploadModalOverlay");
  if (overlay) overlay.classList.remove("show");
}

async function _iniciarApp() {
  const dados = await _carregarDados();
  if (dados && dados.length) {
    // Já há dados: mostra dashboard diretamente
    const mc = document.getElementById("main-content");
    if (mc) mc.style.display = "block";
    renderIndex(dados);
    // Garante que o modal NÃO aparece automaticamente
    const overlay = document.getElementById("uploadModalOverlay");
    if (overlay) overlay.classList.remove("show");
  } else {
    // Sem dados: abre modal de upload
    mostrarPainelUpload();
  }
}

// ══════════════════════════════════════════════════════════════════
//  processarCSV (index.html)
// ══════════════════════════════════════════════════════════════════

function processarCSV() {
  if (!_csvFile) return;

  // Fecha o modal e mostra feedback de loading na página
  fecharPainelUpload();

  const loadEl = document.getElementById("loading-state");
  const errEl = document.getElementById("error-state");
  const errMsgEl = document.getElementById("error-msg");
  const contentEl = document.getElementById("main-content");
  if (loadEl) loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const csvText = e.target.result;
      const projetos = parseCSVText(csvText);
      if (!projetos.length)
        throw new Error("Nenhum projeto válido encontrado no CSV.");

      // Salva no IndexedDB — persiste entre páginas, suporta 500+ linhas
      await _salvarDados(projetos);

      if (loadEl) loadEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      renderIndex(projetos);
      enviarParaServidor(projetos);

      if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
    } catch (err) {
      if (loadEl) loadEl.style.display = "none";
      if (errEl) errEl.style.display = "flex";
      if (errMsgEl)
        errMsgEl.textContent = `Erro ao processar CSV: ${err.message}`;
      // Reabre o modal em caso de erro para o usuário tentar novamente
      mostrarPainelUpload();
    }
  };
  reader.readAsText(_csvFile, "UTF-8");
}

function enviarParaServidor(dados) {
  // Em produção, troque pela URL do seu backend ou use variável de ambiente
  const API_BASE = window.ESG_API_URL || "http://localhost:3000";
  fetch(`${API_BASE}/dados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro na resposta do servidor");
      return res.json();
    })
    .then((data) => console.info("Sincronização com banco concluída.", data))
    .catch((err) =>
      console.warn("Erro ao sincronizar com banco (non-blocking):", err),
    );
}

// ══════════════════════════════════════════════════════════════════
//  renderIndex — portfólio + dashboard (index.html)
// ══════════════════════════════════════════════════════════════════

function renderIndex(projetos) {
  setupCharts();

  const totalImpacto = projetos.reduce(
    (s, p) => s + p.impactoSocialDireto + p.impactoSocialIndireto,
    0,
  );
  const eixosUnicos = [...new Set(projetos.map((p) => p.eixo).filter(Boolean))];
  function setText(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  setText("stat-total", projetos.length);
  setText("stat-impacto", numFmt(totalImpacto));
  setText("stat-cats", eixosUnicos.length);

  const kpiRow = document.getElementById("kpi-row");
  if (kpiRow) {
    const totalDireto = projetos.reduce((s, p) => s + p.impactoSocialDireto, 0);
    const totalIndireto = projetos.reduce(
      (s, p) => s + p.impactoSocialIndireto,
      0,
    );
    const empresas = [
      ...new Set(projetos.map((p) => p.empresa).filter(Boolean)),
    ];
    const kpis = [
      {
        icon: "fa-users",
        label: "Impacto Direto Total",
        val: numFmt(totalDireto),
        cor: "#ffd700",
      },
      {
        icon: "fa-globe",
        label: "Impacto Indireto Total",
        val: numFmt(totalIndireto),
        cor: "#2ecc71",
      },
      {
        icon: "fa-building",
        label: "Empresas",
        val: empresas.length,
        cor: "#3498db",
      },
      {
        icon: "fa-compass",
        label: "Eixos de Atuação",
        val: eixosUnicos.length,
        cor: "#e67e22",
      },
    ];
    kpiRow.innerHTML = kpis
      .map(
        (k) => `
      <div class="kpi-card" style="border-top:3px solid ${k.cor}">
        <i class="fa-solid ${k.icon}" style="color:${k.cor};font-size:1.4rem;margin-bottom:8px"></i>
        <span class="kpi-val">${k.val}</span>
        <span class="kpi-label">${k.label}</span>
      </div>`,
      )
      .join("");
  }

  // Linha: projetos por ano
  const anoMap = {};
  projetos.forEach((p) => {
    if (!p.postado) return;
    const ano = new Date(p.postado).getFullYear();
    if (!isNaN(ano)) anoMap[ano] = (anoMap[ano] || 0) + 1;
  });
  const anosSort = Object.keys(anoMap).sort();
  makeLine(
    "graficoLinha",
    anosSort,
    anosSort.map((a) => anoMap[a]),
    "Projetos enviados",
  );

  // Barras ODS
  const odsMap = {};
  projetos.forEach((p) => {
    [p.ods1, p.ods2, p.ods3].filter(Boolean).forEach((o) => {
      odsMap[o] = (odsMap[o] || 0) + 1;
    });
  });
  const odsLabels = Object.keys(odsMap);
  makeBar("graficoODS", odsLabels, [
    {
      label: "Projetos",
      data: odsLabels.map((o) => odsMap[o]),
      backgroundColor: odsLabels.map(
        (_, i) => CHART_COLORS[i % CHART_COLORS.length],
      ),
      borderRadius: 6,
      borderSkipped: false,
    },
  ]);

  // Pizza por eixo
  const eixoMap = {};
  projetos.forEach((p) => {
    const e = p.eixo || "Não informado";
    eixoMap[e] = (eixoMap[e] || 0) + 1;
  });
  const eixoLabels = Object.keys(eixoMap);
  makePie(
    "graficoPizza",
    eixoLabels,
    Object.values(eixoMap),
    eixoLabels.map((e, i) => eixoColor(e, i)),
  );

  // Radar por área primária
  const areaMap = {};
  projetos.forEach((p) => {
    const a = p.areaPrimaria || "Sem área";
    areaMap[a] = (areaMap[a] || 0) + 1;
  });
  const areaLabels = Object.keys(areaMap);
  makeRadar(
    "graficoRadar",
    areaLabels,
    areaLabels.map((a) => areaMap[a]),
    "Projetos",
  );

  // Barras impacto direto por projeto
  makeBar(
    "graficoImpacto",
    projetos.map((p) => p.titulo || p.empresa || "Projeto"),
    [
      {
        label: "Impacto Social Direto",
        data: projetos.map((p) => p.impactoSocialDireto),
        backgroundColor: projetos.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length],
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  );
}

// ── Cards de projeto movidos para impactos.html ─────────────────

// ══════════════════════════════════════════════════════════════════
//  IMPACTOS.HTML — Grid 3×3 com paginação e "ver todos"
// ══════════════════════════════════════════════════════════════════

const ITENS_POR_PAGINA = 9; // 3 colunas × 3 linhas
const ITENS_INICIAL = 9; // quantos mostrar antes de perguntar
let _todosProj = [];
let _paginaAtual = 1;
let _modoVerTodos = false; // true = sem paginação, todos de uma vez

function _totalPaginas() {
  if (_modoVerTodos) return 1;
  return Math.ceil(_todosProj.length / ITENS_POR_PAGINA);
}

// ── Info pill persistente "ver todos" ────────────────────────────
//   Fica como ícone ⓘ. Ao clicar, abre dropdown com opção ver todos.

function _renderInfoPill(total) {
  // Remove instância anterior se existir
  const antigo = document.getElementById("info-pill-wrap");
  if (antigo) antigo.remove();

  if (total <= ITENS_INICIAL) return; // poucos projetos, não precisa

  const wrap = document.createElement("div");
  wrap.id = "info-pill-wrap";
  wrap.style.cssText = `
    display:flex; justify-content:center;
    padding:0 24px 12px; max-width:1200px; margin:0 auto;
  `;

  wrap.innerHTML = `
    <div class="info-pill" id="info-pill">
      <button class="info-pill-btn" id="info-pill-trigger" onclick="_toggleInfoDropdown()" title="Informações de paginação">
        <i class="fa-solid fa-circle-info"></i>
        <span>${total} projetos · página ${_paginaAtual} de ${_totalPaginas()}</span>
        <i class="fa-solid fa-chevron-down info-pill-chevron" id="info-pill-chevron"></i>
      </button>
      <div class="info-pill-dropdown" id="info-pill-dropdown">
        <p style="margin:0 0 12px;font-size:.85rem;color:rgba(255,255,255,0.6);line-height:1.5">
          Exibindo <strong style="color:#fff">${ITENS_POR_PAGINA} por página</strong>.
          Deseja carregar todos os <strong style="color:#ffd700">${total} projetos</strong> de uma vez?
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="_ativarVerTodos()" class="info-pill-action-btn primary">
            <i class="fa-solid fa-expand"></i> Ver todos (${total})
          </button>
          <button onclick="_fecharInfoDropdown()" class="info-pill-action-btn secondary">
            Manter paginado
          </button>
        </div>
      </div>
    </div>
  `;

  const paginacaoTop = document.getElementById("paginacao-top");
  if (paginacaoTop) paginacaoTop.insertAdjacentElement("afterend", wrap);
}

function _toggleInfoDropdown() {
  const dd = document.getElementById("info-pill-dropdown");
  const ch = document.getElementById("info-pill-chevron");
  const pill = document.getElementById("info-pill");
  if (!dd) return;
  const open = dd.classList.toggle("show");
  if (ch) ch.style.transform = open ? "rotate(180deg)" : "";
  if (pill) pill.classList.toggle("open", open);
}

function _fecharInfoDropdown() {
  const dd = document.getElementById("info-pill-dropdown");
  const ch = document.getElementById("info-pill-chevron");
  const pill = document.getElementById("info-pill");
  if (dd) dd.classList.remove("show");
  if (ch) ch.style.transform = "";
  if (pill) pill.classList.remove("open");
}

function _atualizarInfoPill() {
  // Atualiza o texto de página sem recriar o pill
  const trigger = document.getElementById("info-pill-trigger");
  if (!trigger) return;
  const span = trigger.querySelector("span");
  if (span)
    span.textContent = `${_todosProj.length} projetos · página ${_paginaAtual} de ${_totalPaginas()}`;
}

function _ativarVerTodos() {
  _modoVerTodos = true;
  _fecharInfoDropdown();
  // Remove pill pois paginação sumiu
  const wrap = document.getElementById("info-pill-wrap");
  if (wrap) wrap.remove();
  _renderPagina(1);
}

// ── Card compacto para o grid 3×3 ────────────────────────────────
function _buildImpactoCardGrid(p, idx) {
  const cor = eixoColor(p.eixo, idx);
  const odsArr = [p.ods1, p.ods2, p.ods3].filter(Boolean);
  const cardId = `imp-${idx}`;

  const div = document.createElement("div");
  div.className = "impacto-grid-card";
  div.setAttribute("data-aos", "fade-up");
  div.setAttribute("data-aos-duration", "500");
  div.setAttribute(
    "data-aos-delay",
    String(Math.min((idx % ITENS_POR_PAGINA) * 50, 250)),
  );
  div.style.cssText = `
    background:rgba(20,28,74,0.82); border:1px solid rgba(255,255,255,0.07);
    border-top:3px solid ${cor}; border-radius:14px;
    padding:22px 20px 18px; display:flex; flex-direction:column; gap:12px;
    transition:transform .2s, box-shadow .2s; cursor:default;
  `;
  div.onmouseenter = () => {
    div.style.transform = "translateY(-4px)";
    div.style.boxShadow = `0 8px 28px rgba(0,0,0,0.35)`;
  };
  div.onmouseleave = () => {
    div.style.transform = "";
    div.style.boxShadow = "";
  };

  div.innerHTML = `
    <!-- Topo: badges + empresa -->
    <div>
      ${p.empresa ? `<div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${cor};margin-bottom:5px">${p.empresa}</div>` : ""}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        ${p.eixo ? `<span style="padding:3px 10px;border-radius:50px;font-size:.68rem;font-weight:700;background:${cor}22;color:${cor};border:1px solid ${cor}44">${p.eixo}</span>` : ""}
        ${p.natureza ? `<span style="padding:3px 10px;border-radius:50px;font-size:.68rem;font-weight:600;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5)">${p.natureza}</span>` : ""}
      </div>
      <h3 style="font-size:.95rem;font-weight:700;color:#fff;margin:0;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
        ${p.titulo || "Sem título"}
      </h3>
    </div>

    <!-- Resumo -->
    ${
      p.resumo || p.descricaoDesafio
        ? `
      <p style="font-size:.8rem;color:rgba(255,255,255,0.5);margin:0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
        ${p.resumo || p.descricaoDesafio}
      </p>`
        : ""
    }

    <!-- Números de impacto -->
    <div style="display:flex;gap:20px;padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)">
      <div style="display:flex;flex-direction:column">
        <span style="font-size:1.15rem;font-weight:800;color:${cor};font-family:'Space Mono',monospace">${numFmt(p.impactoSocialDireto)}</span>
        <span style="font-size:.68rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.6px">direto</span>
      </div>
      <div style="display:flex;flex-direction:column">
        <span style="font-size:1.15rem;font-weight:800;color:#2ecc71;font-family:'Space Mono',monospace">${numFmt(p.impactoSocialIndireto)}</span>
        <span style="font-size:.68rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.6px">indireto</span>
      </div>
    </div>

    <!-- ODS + mini-gráfico -->
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px">
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${odsArr.map((o) => `<span style="padding:2px 8px;border-radius:50px;font-size:.65rem;font-weight:700;background:rgba(52,152,219,0.12);border:1px solid rgba(52,152,219,0.25);color:rgba(52,152,219,0.9)">${o}</span>`).join("")}
        ${p.responsavel ? `<span style="font-size:.68rem;color:rgba(255,255,255,0.3);margin-top:auto;padding-top:4px"><i class="fa-solid fa-user" style="margin-right:3px;opacity:.5"></i>${p.responsavel}</span>` : ""}
      </div>
      <div style="flex-shrink:0;width:72px;height:44px;position:relative">
        <canvas id="mini-${cardId}" style="position:absolute;inset:0;width:100%!important;height:100%!important"></canvas>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const canvas = div.querySelector(`#mini-${cardId}`);
    if (canvas)
      makeMiniBar(
        canvas,
        ["D", "I"],
        [p.impactoSocialDireto, p.impactoSocialIndireto],
        [cor + "cc", "#2ecc7199"],
      );
  });

  return div;
}

// ── Paginação ─────────────────────────────────────────────────────
function _renderPaginacao() {
  const total = _totalPaginas();
  ["paginacao-top", "paginacao-bottom"].forEach((cid) => {
    const el = document.getElementById(cid);
    if (!el) return;
    if (total <= 1) {
      el.innerHTML = "";
      return;
    }
    const range = _buildPageRange(_paginaAtual, total);
    let html = `<div class="pag-info">Página ${_paginaAtual} de ${total} · ${_todosProj.length} projetos</div>`;
    html += `<button class="pag-btn" onclick="_renderPagina(${_paginaAtual - 1})" ${_paginaAtual === 1 ? "disabled" : ""}>‹ Anterior</button>`;
    range.forEach((p) => {
      html +=
        p === "…"
          ? `<span class="pag-sep">…</span>`
          : `<button class="pag-btn ${p === _paginaAtual ? "active" : ""}" onclick="_renderPagina(${p})">${p}</button>`;
    });
    html += `<button class="pag-btn" onclick="_renderPagina(${_paginaAtual + 1})" ${_paginaAtual === total ? "disabled" : ""}>Próxima ›</button>`;
    el.innerHTML = html;
  });
}

function _buildPageRange(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const p = [];
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) p.push(i);
    p.push("…");
    p.push(total);
  } else if (cur >= total - 3) {
    p.push(1);
    p.push("…");
    for (let i = total - 4; i <= total; i++) p.push(i);
  } else {
    p.push(1);
    p.push("…");
    for (let i = cur - 1; i <= cur + 1; i++) p.push(i);
    p.push("…");
    p.push(total);
  }
  return p;
}

function _renderPagina(pagina) {
  _paginaAtual = pagina;
  const inicio = _modoVerTodos ? 0 : (pagina - 1) * ITENS_POR_PAGINA;
  const slice = _modoVerTodos
    ? _todosProj
    : _todosProj.slice(inicio, inicio + ITENS_POR_PAGINA);

  const grid = document.getElementById("impactos-lista");
  if (!grid) return;

  // Aplica estilo de grid 3 colunas
  grid.style.cssText = `
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:20px;
    padding:0 24px 32px;
    max-width:1200px;
    margin:0 auto;
    box-sizing:border-box;
  `;

  grid.innerHTML = "";
  slice.forEach((p, i) =>
    grid.appendChild(_buildImpactoCardGrid(p, inicio + i)),
  );
  _renderPaginacao();

  if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 80);
  _atualizarInfoPill();
  if (pagina > 1) {
    const s = document.querySelector(".section-label");
    if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ── Gráficos globais (impactos.html) ─────────────────────────────

function _renderGraficosImpactos(projetos) {
  setupCharts();

  const eixoMap = {};
  projetos.forEach((p, i) => {
    const e = p.eixo || "Sem eixo";
    eixoMap[e] =
      (eixoMap[e] || 0) + p.impactoSocialDireto + p.impactoSocialIndireto;
  });
  const eixoLabels = Object.keys(eixoMap);
  const eixoCores = eixoLabels.map((e, i) => eixoColor(e, i));
  makePie("categoriaChart", eixoLabels, Object.values(eixoMap), eixoCores);

  const legEl = document.getElementById("legend-categorias");
  if (legEl) {
    legEl.innerHTML = eixoLabels
      .map(
        (e, i) =>
          `<div class="legend-item"><span class="legend-dot" style="background:${eixoCores[i]}"></span><span>${e} — ${numFmt(eixoMap[e])}</span></div>`,
      )
      .join("");
  }

  makeBar(
    "impactosBar",
    projetos.map((p) => p.titulo || p.empresa || "Projeto"),
    [
      {
        label: "Impacto Social Direto",
        data: projetos.map((p) => p.impactoSocialDireto),
        backgroundColor: projetos.map(
          (_, i) => CHART_COLORS[i % CHART_COLORS.length],
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
    true,
  );
}

// ── Init impactos.html ────────────────────────────────────────────

async function carregarImpactos() {
  const loadEl = document.getElementById("imp-loading");
  const errEl = document.getElementById("imp-error");
  const errMsgEl = document.getElementById("imp-error-msg");
  const contentEl = document.getElementById("imp-content");

  // Carrega do IndexedDB (suporta 500+ linhas)
  const projetos = await _carregarDados();

  if (!projetos || !projetos.length) {
    if (loadEl) loadEl.style.display = "none";
    if (errEl) errEl.style.display = "flex";
    if (errMsgEl)
      errMsgEl.textContent =
        "Nenhum dado encontrado. Acesse a página principal e faça o upload do CSV primeiro.";
    return;
  }

  if (loadEl) loadEl.style.display = "none";
  if (contentEl) contentEl.style.display = "block";

  _todosProj = projetos;
  _paginaAtual = 1;
  _modoVerTodos = false;

  _renderPagina(1);

  // Info pill persistente (ícone ⓘ com dropdown ver-todos)
  setTimeout(() => _renderInfoPill(projetos.length), 50);

  _renderGraficosImpactos(projetos);
}

// ══════════════════════════════════════════════════════════════════
//  DOMContentLoaded
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const fi = document.getElementById("fileInput");
  const dz = document.getElementById("dropZone");
  const po = document.getElementById("popupOverlay");
  const mo = document.getElementById("uploadModalOverlay");

  if (fi)
    fi.addEventListener("change", (e) => {
      if (e.target.files[0]) _processFile(e.target.files[0]);
    });

  if (dz) {
    dz.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!_csvFile) dz.classList.add("dragover");
    });
    dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) _processFile(file);
    });
  }

  // Fecha popup de extensão ao clicar fora
  if (po)
    po.addEventListener("click", (e) => {
      if (e.target === po) closePopup();
    });

  // Fecha modal de upload ao clicar fora do card (só se já há dashboard)
  if (mo)
    mo.addEventListener("click", (e) => {
      if (e.target === mo) fecharPainelUpload();
    });

  document.querySelectorAll("nav a").forEach((a) =>
    a.addEventListener("click", () => {
      const m = document.getElementById("menu");
      if (m) m.classList.remove("active");
    }),
  );

  // index.html: inicia app (carrega dados do IndexedDB ou abre modal)
  if (document.getElementById("uploadModalOverlay")) _iniciarApp();

  // impactos.html: lê IndexedDB
  if (document.getElementById("imp-loading")) carregarImpactos();
});
