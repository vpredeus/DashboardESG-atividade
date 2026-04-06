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
  const result = [];
  let cur = "",
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === sep && !inQ) {
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
  const _titDesafio =
    raw["título do desafio"] ||
    raw["titulo do desafio"] ||
    raw["título"] ||
    raw["titulo"] ||
    raw["name"] ||
    raw["nome"] ||
    "";
  const _descDesafio =
    raw["descrição do desafio"] ||
    raw["descricao do desafio"] ||
    raw["description"] ||
    raw["desc"] ||
    "";
  const _areaPrimaria =
    raw["área_primária"] ||
    raw["area_primaria"] ||
    raw["área primária"] ||
    raw["area primaria"] ||
    "";
  const _areaSecundaria =
    raw["área_secundária"] ||
    raw["area_secundaria"] ||
    raw["área secundária"] ||
    "";
  const _ods1 = raw["ods_1"] || raw["ods 1"] || raw["ods1"] || "";
  const _ods2 = raw["ods_2"] || raw["ods 2"] || raw["ods2"] || "";
  const _ods3 = raw["ods_3"] || raw["ods 3"] || raw["ods3"] || "";
  const _direto =
    parseInt(
      raw["impacto_social_direto_num"] || raw["impacto social direto"] || "0",
      10,
    ) || 0;
  const _indireto =
    parseInt(
      raw["impacto_social_indireto_num"] ||
        raw["impacto social indireto"] ||
        "0",
      10,
    ) || 0;

  return {
    // ── snake_case: enviado ao servidor (POST /indicadores) ──
    postado: raw["postado"] || raw["data/hora do envio"] || raw["data"] || "",
    tipo: raw["tipo"] || "",
    empresa: raw["empresa"] || raw["company"] || "",
    responsavel:
      raw["responsável"] || raw["responsavel"] || raw["responsible"] || "",
    email: raw["e-mail"] || raw["email"] || "",
    titulo_desafio: _titDesafio,
    descricao_desafio: _descDesafio,
    descricao: raw["descrição"] || raw["descricao"] || "",
    area_primaria: _areaPrimaria,
    area_secundaria: _areaSecundaria,
    resumo: raw["resumo"] || raw["summary"] || "",
    ods_1: _ods1,
    ods_2: _ods2,
    ods_3: _ods3,
    impacto_social_direto_num: _direto,
    impacto_social_indireto_num: _indireto,
    eixo: raw["eixo"] || "",
    natureza: raw["natureza"] || "",
    // ── camelCase: consumido pelo front-end (renderIndex, cards) ──
    titulo: _titDesafio,
    descricaoDesafio: _descDesafio,
    areaPrimaria: _areaPrimaria,
    areaSecundaria: _areaSecundaria,
    ods1: _ods1,
    ods2: _ods2,
    ods3: _ods3,
    impactoSocialDireto: _direto,
    impactoSocialIndireto: _indireto,
  };
}

function parseCSVText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l);
  if (!lines.length) return [];

  // Tenta detectar o separador contando ocorrências na primeira linha
  const firstLine = lines[0];
  const countSemicolon = (firstLine.match(/;/g) || []).length;
  const countComma = (firstLine.match(/,/g) || []).length;
  const sep = countSemicolon >= countComma ? ";" : ",";

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
    .filter((p) => p.titulo_desafio || p.empresa);
}

// ══════════════════════════════════════════════════════════════════
//  DEDUPLICAÇÃO FRONT-END
//  Remove linhas completamente idênticas em todos os campos antes
//  de enviar ao servidor. Compara os mesmos campos snake_case que
//  o back-end usa, garantindo consistência entre as duas camadas.
// ══════════════════════════════════════════════════════════════════

/**
 * Gera uma chave de assinatura canônica para um projeto.
 * Usa exclusivamente os campos snake_case — os mesmos enviados
 * no POST /indicadores e comparados pelo back-end no banco.
 */
function _assinaturaLinha(p) {
  const norm = (v) => (v == null ? "" : String(v).trim().toLowerCase());
  const normDate = (v) => {
    if (!v) return "";
    // Suporta DD/MM/YYYY HH:MM:SS (formato do CSV brasileiro)
    const br = String(v).match(
      /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
    );
    if (br) {
      const iso = `${br[3]}-${br[2]}-${br[1]}T${br[4]}:${br[5]}:${br[6]}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? norm(v) : d.toISOString();
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? norm(v) : d.toISOString();
  };
  return [
    normDate(p.postado),
    norm(p.tipo),
    norm(p.empresa),
    norm(p.responsavel),
    norm(p.email),
    norm(p.titulo_desafio), // snake_case — alinhado com o back-end
    norm(p.descricao_desafio),
    norm(p.descricao),
    norm(p.area_primaria),
    norm(p.area_secundaria),
    norm(p.resumo),
    norm(p.ods_1),
    norm(p.ods_2),
    norm(p.ods_3),
    norm(p.impacto_social_direto_num),
    norm(p.impacto_social_indireto_num),
    norm(p.eixo),
    norm(p.natureza),
  ].join("||");
}

/**
 * Recebe o array de projetos parseados e retorna apenas as linhas únicas.
 * A primeira ocorrência de cada combinação é mantida; as seguintes removidas.
 * Retorna { unicos, removidos } para exibir no toast se necessário.
 */
function _deduplicarCSV(projetos) {
  const visto = new Set();
  const unicos = [];
  let removidos = 0;

  for (const p of projetos) {
    const chave = _assinaturaLinha(p);
    if (visto.has(chave)) {
      removidos++;
    } else {
      visto.add(chave);
      unicos.push(p);
    }
  }

  return { unicos, removidos };
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
  // Só zera os stats se o dashboard não está visível (sem dados do servidor)
  const mc = document.getElementById("main-content");
  if (!mc || mc.style.display === "none") {
    ["stat-total", "stat-impacto", "stat-cats"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "—";
    });
  }
}

// ── Controle do modal de upload (overlay) ───────────────────────

function mostrarPainelUpload() {
  const overlay = document.getElementById("uploadModalOverlay");
  if (!overlay) return;

  // Injeta o formulário de upload dentro do modal se ainda não tiver
  const wrapper = document.getElementById("modal-upload-wrapper");
  if (wrapper && !wrapper.querySelector(".drop-zone")) {
    wrapper.innerHTML = `
      <div class="drop-zone" id="dropZoneModal"
        onclick="document.getElementById('fileInputModal').click()">
        <div class="dz-icon-wrap">
          <i class="fa-solid fa-file-circle-plus" id="dzIconModal"></i>
        </div>
        <div class="dz-title" id="dzTitleModal">Arraste seu arquivo aqui</div>
        <div class="dz-subtitle" id="dzSubModal">
          ou <strong>clique para selecionar</strong>
        </div>
        <span class="dz-badge" id="dzBadgeModal">
          <i class="fa-solid fa-lock" style="font-size:10px;margin-right:4px"></i>
          Apenas .csv
        </span>
        <input type="file" id="fileInputModal" accept=".csv" />
      </div>
      <div class="progress-wrap" id="progressWrapModal">
        <div class="progress-bar" id="progressBarModal"></div>
      </div>
      <div class="file-preview" id="filePreviewModal">
        <i class="fa-solid fa-file-circle-check fp-icon"></i>
        <div class="fp-info">
          <div class="fp-name" id="fpNameModal">arquivo.csv</div>
          <div class="fp-meta" id="fpMetaModal">—</div>
        </div>
        <button class="fp-remove" onclick="clearUploadModal()">
          <i class="fa-solid fa-xmark" style="margin-right:4px"></i>Remover
        </button>
      </div>
      <div class="upload-cta">
        <button class="btn-gerar" id="btnGerarModal" disabled onclick="processarCSVModal()">
          <i class="fa-solid fa-chart-line"></i>
          Gerar Dashboards
        </button>
        <button class="btn-limpar" id="btnLimparModal" onclick="clearUploadModal()">
          <i class="fa-solid fa-rotate-left"></i>
          Limpar
        </button>
      </div>
      <div class="csv-preview-section" id="csvPreviewSectionModal">
        <div class="csv-preview-title">
          <i class="fa-solid fa-table-cells-large"></i>
          Pré-visualização — primeiras 5 linhas
        </div>
        <div class="csv-table-wrap">
          <table class="csv-table" id="csvTableModal"></table>
        </div>
        <div class="csv-preview-more" id="csvPreviewMoreModal"></div>
      </div>`;

    // Registra eventos no input do modal
    const fiModal = document.getElementById("fileInputModal");
    if (fiModal)
      fiModal.addEventListener("change", (e) => {
        if (e.target.files[0]) _processFileModal(e.target.files[0]);
      });
    const dzModal = document.getElementById("dropZoneModal");
    if (dzModal) {
      dzModal.addEventListener("dragover", (e) => {
        e.preventDefault();
        dzModal.classList.add("dragover");
      });
      dzModal.addEventListener("dragleave", () =>
        dzModal.classList.remove("dragover"),
      );
      dzModal.addEventListener("drop", (e) => {
        e.preventDefault();
        dzModal.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file) _processFileModal(file);
      });
    }
  }

  overlay.classList.add("show");
}

function fecharPainelUpload() {
  const overlay = document.getElementById("uploadModalOverlay");
  if (overlay) overlay.classList.remove("show");
}

function fecharModal(e) {
  // Fecha ao clicar no overlay escuro (fora do card)
  if (e.target === e.currentTarget) fecharPainelUpload();
}

// ── Variável de arquivo para o modal ────────────────────────────
let _csvFileModal = null;

function _processFileModal(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext !== "csv") {
    _showPopupError(file);
    return;
  }
  _csvFileModal = file;

  const dzModal = document.getElementById("dropZoneModal");
  const dzIconM = document.getElementById("dzIconModal");
  const dzTitleM = document.getElementById("dzTitleModal");
  const dzSubM = document.getElementById("dzSubModal");
  const dzBadgeM = document.getElementById("dzBadgeModal");
  const fpM = document.getElementById("filePreviewModal");
  const fpNameM = document.getElementById("fpNameModal");
  const fpMetaM = document.getElementById("fpMetaModal");
  const pgWrapM = document.getElementById("progressWrapModal");
  const pgBarM = document.getElementById("progressBarModal");
  const btnGM = document.getElementById("btnGerarModal");
  const btnLM = document.getElementById("btnLimparModal");

  if (fpM) fpM.classList.remove("show");
  if (btnGM) btnGM.disabled = true;
  if (pgBarM) pgBarM.style.width = "0%";

  // Simula progresso
  if (pgWrapM) pgWrapM.classList.add("show");
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      setTimeout(() => {
        if (pgWrapM) pgWrapM.classList.remove("show");
        if (fpNameM) fpNameM.textContent = file.name;
        if (fpMetaM)
          fpMetaM.textContent = `${_fmtBytes(file.size)} · ${new Date().toLocaleDateString("pt-BR")}`;
        if (fpM) fpM.classList.add("show");
        if (dzModal) dzModal.classList.add("has-file");
        if (dzIconM) dzIconM.className = "fa-solid fa-file-circle-check";
        if (dzTitleM) dzTitleM.textContent = "Arquivo carregado com sucesso";
        if (dzSubM)
          dzSubM.innerHTML =
            '<strong style="color:#2ecc71">Pronto para gerar os dashboards</strong>';
        if (btnGM) btnGM.disabled = false;
        if (btnLM) btnLM.classList.add("show");
        // Preview CSV
        const reader = new FileReader();
        reader.onload = (ev) => {
          const lines = ev.target.result
            .trim()
            .split("\n")
            .filter((l) => l.trim());
          if (!lines.length) return;
          const sep = lines[0].includes(";") ? ";" : ",";
          const headers = lines[0]
            .split(sep)
            .map((h) => h.replace(/"/g, "").trim());
          const rows = lines.slice(1, 6);
          const total = lines.length - 1;
          let html =
            "<thead><tr>" +
            headers.map((h) => `<th>${h}</th>`).join("") +
            "</tr></thead><tbody>";
          rows.forEach((row) => {
            const cells = row.split(sep).map((c) => c.replace(/"/g, "").trim());
            html +=
              "<tr>" +
              cells.map((c) => `<td>${c || "—"}</td>`).join("") +
              "</tr>";
          });
          html += "</tbody>";
          const tbl = document.getElementById("csvTableModal");
          const more = document.getElementById("csvPreviewMoreModal");
          const sec = document.getElementById("csvPreviewSectionModal");
          if (tbl) tbl.innerHTML = html;
          if (more)
            more.textContent =
              total > 5
                ? `+ ${total - 5} linha${total - 5 !== 1 ? "s" : ""} adicionais`
                : `Total: ${total} linha${total !== 1 ? "s" : ""}`;
          if (sec) sec.classList.add("show");
        };
        reader.readAsText(file);
      }, 200);
    }
    if (pgBarM) pgBarM.style.width = Math.min(pct, 100) + "%";
  }, 60);
}

function clearUploadModal() {
  _csvFileModal = null;
  const fi = document.getElementById("fileInputModal");
  if (fi) fi.value = "";
  ["filePreviewModal", "csvPreviewSectionModal", "progressWrapModal"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("show");
    },
  );
  const btnG = document.getElementById("btnGerarModal");
  if (btnG) btnG.disabled = true;
  const btnL = document.getElementById("btnLimparModal");
  if (btnL) btnL.classList.remove("show");
  const dz = document.getElementById("dropZoneModal");
  if (dz) {
    dz.classList.remove("has-file");
  }
  const dzI = document.getElementById("dzIconModal");
  if (dzI) dzI.className = "fa-solid fa-file-circle-plus";
  const dzT = document.getElementById("dzTitleModal");
  if (dzT) dzT.textContent = "Arraste seu arquivo aqui";
  const dzS = document.getElementById("dzSubModal");
  if (dzS) dzS.innerHTML = "ou <strong>clique para selecionar</strong>";
}

function processarCSVModal() {
  if (!_csvFileModal) return;
  fecharPainelUpload();

  const loadEl = document.getElementById("loading-state");
  const errEl = document.getElementById("error-state");
  const errMsgEl = document.getElementById("error-msg");
  const contentEl = document.getElementById("main-content");
  const uploadWrap = document.getElementById("upload-inline-wrap");

  if (loadEl) loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parseados = parseCSVText(e.target.result);
      if (!parseados.length)
        throw new Error("Nenhum projeto válido encontrado no CSV.");

      // Remove duplicatas internas do próprio CSV (todos os campos iguais)
      const { unicos: projetos, removidos } = _deduplicarCSV(parseados);
      if (removidos > 0) {
        _showToast(
          `${removidos} linha${removidos > 1 ? "s duplicadas removidas" : " duplicada removida"} do CSV antes do envio.`,
          "info",
          "fa-solid fa-filter",
        );
        await new Promise((r) => setTimeout(r, 600));
      }

      await enviarParaServidor(projetos);
      if (loadEl) loadEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      if (uploadWrap) uploadWrap.style.display = "none";
      renderIndex(projetos);
      if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
    } catch (err) {
      if (loadEl) loadEl.style.display = "none";
      if (errEl) errEl.style.display = "flex";
      if (errMsgEl)
        errMsgEl.textContent = `Erro ao processar CSV: ${err.message}`;
    }
  };
  reader.readAsText(_csvFileModal, "UTF-8");
}

/**
 * Inicializa o index.html buscando dados do servidor (GET /indicadores).
 * Só usa o bloco de upload se o servidor não retornar dados.
 */
async function _iniciarApp() {
  const loadEl = document.getElementById("loading-state");
  const errEl = document.getElementById("error-state");
  const errMsgEl = document.getElementById("error-msg");
  const contentEl = document.getElementById("main-content");
  const uploadWrap = document.getElementById("upload-inline-wrap");

  // Mostra spinner e oculta conteúdo enquanto busca
  if (loadEl) loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";

  try {
    const API_BASE = window.ESG_API_URL || "http://localhost:3000";
    const res = await fetch(`${API_BASE}/indicadores`);
    if (!res.ok) throw new Error(`Servidor respondeu com status ${res.status}`);

    const raw = await res.json();
    // O back-end retorna array de objetos com campos snake_case — mapeia para camelCase
    const projetos = (Array.isArray(raw) ? raw : [])
      .map(_mapServerRow)
      .filter((p) => p.titulo || p.empresa);

    if (loadEl) loadEl.style.display = "none";

    if (projetos.length) {
      // Há dados no servidor: mostra dashboard e oculta (ou recolhe) upload
      if (contentEl) contentEl.style.display = "block";
      if (uploadWrap) uploadWrap.style.display = "none"; // recolhe por padrão
      renderIndex(projetos);
      if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
    } else {
      // Servidor OK mas sem dados: mantém bloco de upload visível
      if (uploadWrap) uploadWrap.style.display = "";
    }
  } catch (err) {
    if (loadEl) loadEl.style.display = "none";
    // Erro de rede/servidor: exibe mensagem mas mantém upload disponível
    console.warn("Não foi possível conectar ao servidor:", err.message);
    _showToast(
      "Servidor indisponível — você ainda pode importar um CSV.",
      "error",
      "fa-solid fa-server",
    );
    if (uploadWrap) uploadWrap.style.display = "";
  }
}

// ══════════════════════════════════════════════════════════════════
//  processarCSV (index.html)
// ══════════════════════════════════════════════════════════════════

function processarCSV() {
  if (!_csvFile) return;

  const loadEl = document.getElementById("loading-state");
  const errEl = document.getElementById("error-state");
  const errMsgEl = document.getElementById("error-msg");
  const contentEl = document.getElementById("main-content");
  const uploadWrap = document.getElementById("upload-inline-wrap");

  if (loadEl) loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const csvText = e.target.result;
      const parseados = parseCSVText(csvText);
      if (!parseados.length)
        throw new Error("Nenhum projeto válido encontrado no CSV.");

      // Remove duplicatas internas do próprio CSV (todos os campos iguais)
      const { unicos: projetos, removidos } = _deduplicarCSV(parseados);
      if (removidos > 0) {
        _showToast(
          `${removidos} linha${removidos > 1 ? "s duplicadas removidas" : " duplicada removida"} do CSV antes do envio.`,
          "info",
          "fa-solid fa-filter",
        );
        await new Promise((r) => setTimeout(r, 600));
      }

      // Envia ao servidor e aguarda confirmação antes de renderizar
      await enviarParaServidor(projetos);

      if (loadEl) loadEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      if (uploadWrap) uploadWrap.style.display = "none";

      renderIndex(projetos);
      if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
    } catch (err) {
      if (loadEl) loadEl.style.display = "none";
      if (errEl) errEl.style.display = "flex";
      if (errMsgEl)
        errMsgEl.textContent = `Erro ao processar CSV: ${err.message}`;
    }
  };
  reader.readAsText(_csvFile, "UTF-8");
}

// ── Toast de notificação ─────────────────────────────────────────
function _showToast(msg, type, iconClass) {
  const old = document.getElementById("esg-toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.id = "esg-toast";
  toast.className = "esg-toast esg-toast--" + type;
  toast.innerHTML = '<i class="' + iconClass + '"></i><span>' + msg + "</span>";
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function enviarParaServidor(dados) {
  const API_BASE = window.ESG_API_URL || "http://localhost:3000";
  // Envia para POST /indicadores (endpoint real do NestJS)
  return fetch(`${API_BASE}/indicadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // O controller aceita array direto ou { desafios: [] }
    body: JSON.stringify(dados),
  })
    .then((res) => {
      if (!res.ok)
        throw new Error(`Servidor respondeu com status ${res.status}`);
      return res.json();
    })
    .then((result) => {
      const salvos = result?.salvos ?? "?";
      const ignorados = result?.ignorados ?? "?";
      _showToast(
        `Sincronizado: ${salvos} salvos, ${ignorados} ignorados (duplicatas).`,
        "success",
        "fa-solid fa-database",
      );
    })
    .catch((err) => {
      _showToast(
        `Não foi possível sincronizar com o banco: ${err.message}`,
        "error",
        "fa-solid fa-database",
      );
      // Relança para que processarCSV() possa capturar se necessário
      throw err;
    });
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
  const textoPill = _modoVerTodos
    ? `<i class="fa-solid fa-eye"></i> <span>Exibindo todos os ${total} projetos</span>`
    : `<i class="fa-solid fa-circle-info"></i> <span>${total} projetos · página ${_paginaAtual} de ${_totalPaginas()}</span>`;

  // O conteúdo do dropdown muda dependendo do modo
  const conteudoDropdown = _modoVerTodos
    ? `<p style="margin:0 0 12px;font-size:.85rem;color:rgba(255,255,255,0.6);">
         Você está visualizando a lista completa. Deseja voltar para a <strong>exibição paginada</strong>?
       </p>
       <button onclick="_desativarVerTodos()" class="info-pill-action-btn secondary">
         <i class="fa-solid fa-pages"></i> Voltar para paginação
       </button>`
    : `<p style="margin:0 0 12px;font-size:.85rem;color:rgba(255,255,255,0.6);">
         Exibindo <strong>${ITENS_POR_PAGINA} por página</strong>. Carregar todos de uma vez?
       </p>
       <div style="display:flex;gap:8px">
         <button onclick="_ativarVerTodos()" class="info-pill-action-btn primary">Ver todos</button>
         <button onclick="_fecharInfoDropdown()" class="info-pill-action-btn secondary">Manter paginado</button>
       </div>`;

  wrap.innerHTML = `
    <div class="info-pill" id="info-pill">
      <button class="info-pill-btn" id="info-pill-trigger" onclick="_toggleInfoDropdown()">
        ${textoPill}
        <i class="fa-solid fa-chevron-down info-pill-chevron" id="info-pill-chevron"></i>
      </button>
      <div class="info-pill-dropdown" id="info-pill-dropdown">
        ${conteudoDropdown}
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

// Função para mostrar o alerta customizado
function _mostrarAlertaPerformance(total) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("custom-alert-overlay");
    const btnConfirm = document.getElementById("alert-confirm");
    const btnCancel = document.getElementById("alert-cancel");
    const msg = document.getElementById("custom-alert-message");

    msg.innerHTML = `Você está prestes a carregar <strong>${total} projetos</strong>. Isso pode afetar a fluidez do Dashboard em alguns navegadores.`;
    overlay.style.display = "flex";

    btnConfirm.onclick = () => {
      overlay.style.display = "none";
      resolve(true);
    };

    btnCancel.onclick = () => {
      overlay.style.display = "none";
      resolve(false);
    };
  });
}

// Sua função principal atualizada
async function _ativarVerTodos() {
  const total = _todosProj.length;
  const LIMITE_PERFORMANCE = 50;

  // 1. Validação com o Modal Customizado
  if (total > LIMITE_PERFORMANCE) {
    const aceitou = await _mostrarAlertaPerformance(total);
    if (!aceitou) return;
  }

  // 2. Ativa o Loading
  const loading = document.getElementById("loading-overlay");
  loading.style.display = "flex";
  loading.style.opacity = "1";

  // 3. Pequena pausa para o navegador respirar e mostrar o spinner
  setTimeout(() => {
    try {
      _modoVerTodos = true;
      _paginaAtual = 1;
      _fecharInfoDropdown();

      // Renderiza a lista completa
      _renderPagina(1);
      _renderInfoPill(total);

      // 4. Sucesso: Esconde o loading com um pequeno delay para suavidade
      setTimeout(() => {
        loading.style.opacity = "0";
        setTimeout(() => {
          loading.style.display = "none";
        }, 300);
      }, 500);
    } catch (err) {
      console.error("Erro ao renderizar todos:", err);
      loading.style.display = "none";
    }
  }, 50);
}

function _desativarVerTodos() {
  _modoVerTodos = false;
  _paginaAtual = 1; // Sempre volta para a primeira página

  // Ativa o loading para uma transição suave também na volta
  const loading = document.getElementById("loading-overlay");
  if (loading) {
    loading.style.display = "flex";
    loading.style.opacity = "1";
  }

  setTimeout(() => {
    _renderPagina(1); // Re-renderiza respeitando o limite de paginação
    _renderInfoPill(_todosProj.length); // Recria o Pill com o texto de páginas

    if (loading) {
      loading.style.opacity = "0";
      setTimeout(() => {
        loading.style.display = "none";
      }, 300);
    }
  }, 300);
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
    background: linear-gradient(145deg, rgba(20,28,80,0.92) 0%, rgba(15,21,60,0.97) 100%);
    border:1px solid ${cor}33;
    border-top:3px solid ${cor};
    border-radius:16px;
    padding:22px 20px 18px;
    display:flex; flex-direction:column; gap:12px;
    transition:transform .22s cubic-bezier(.34,1.3,.64,1), box-shadow .22s;
    cursor:default;
    box-shadow: 0 4px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
    position: relative; overflow: hidden;
  `;
  // Glow accent top-left
  const glow = document.createElement("div");
  glow.style.cssText = `position:absolute;top:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:${cor};opacity:0.07;pointer-events:none;filter:blur(28px);`;
  div.appendChild(glow);
  div.onmouseenter = () => {
    div.style.transform = "translateY(-5px) scale(1.012)";
    div.style.boxShadow = `0 14px 36px rgba(0,0,0,0.45), 0 0 0 1px ${cor}44`;
    glow.style.opacity = "0.14";
  };
  div.onmouseleave = () => {
    div.style.transform = "";
    div.style.boxShadow =
      "0 4px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)";
    glow.style.opacity = "0.07";
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
    if (total <= 1 || _modoVerTodos) {
      // Sem paginação: mostra mini chip ⓘ colapsado em vez da box
      el.innerHTML = `
        <div class="pag-collapsed-chip" title="Exibindo todos os ${_todosProj.length} projetos">
          <i class="fa-solid fa-circle-info"></i>
          <span>${_todosProj.length} projeto${_todosProj.length !== 1 ? "s" : ""} · todos exibidos</span>
        </div>`;
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

  // ── helpers ──────────────────────────────────────────────────────
  function _legInline(elId, labels, cores, valores, fmtFn) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML =
      '<div class="leg-inline">' +
      labels
        .map(
          (l, i) =>
            `<div class="leg-inline-item">
          <span class="leg-inline-dot" style="background:${cores[i]}"></span>
          <span>${l}</span>
          <span class="leg-inline-val">${fmtFn ? fmtFn(valores[i]) : valores[i]}</span>
        </div>`,
        )
        .join("") +
      "</div>";
  }

  // ── 1. Pizza — Impacto total por eixo ────────────────────────────
  const eixoMap = {};
  projetos.forEach((p) => {
    const e = p.eixo || "Sem eixo";
    eixoMap[e] =
      (eixoMap[e] || 0) +
      (p.impactoSocialDireto || 0) +
      (p.impactoSocialIndireto || 0);
  });
  const eixoLabels = Object.keys(eixoMap);
  const eixoCores = eixoLabels.map((e, i) => eixoColor(e, i));
  makePie("categoriaChart", eixoLabels, Object.values(eixoMap), eixoCores);

  const legCat = document.getElementById("legend-categorias");
  if (legCat) {
    legCat.innerHTML =
      '<div class="leg-inline">' +
      eixoLabels
        .map(
          (e, i) =>
            `<div class="leg-inline-item">
          <span class="leg-inline-dot" style="background:${eixoCores[i]}"></span>
          <span>${e}</span>
          <span class="leg-inline-val">${numFmt(eixoMap[e])}</span>
        </div>`,
        )
        .join("") +
      "</div>";
  }

  // ── 2. Barras agrupadas — Direto vs Indireto por projeto ─────────
  const labelsProj = projetos.map(
    (p) =>
      (p.titulo || p.titulo_desafio || p.empresa || "Projeto").substring(
        0,
        28,
      ) + ((p.titulo || p.titulo_desafio || "").length > 28 ? "…" : ""),
  );
  const el2 = document.getElementById("impactosBar");
  if (el2) {
    _destroyIfExists("impactosBar");
    new Chart(el2, {
      type: "bar",
      data: {
        labels: labelsProj,
        datasets: [
          {
            label: "Impacto Direto",
            data: projetos.map((p) => p.impactoSocialDireto || 0),
            backgroundColor: "rgba(255,215,0,0.75)",
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: "Impacto Indireto",
            data: projetos.map((p) => p.impactoSocialIndireto || 0),
            backgroundColor: "rgba(46,204,113,0.65)",
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { labels: { color: DARK.textBold, font: { size: 12 } } },
          tooltip: DARK.tooltip,
        },
        scales: {
          x: {
            ticks: { color: DARK.text },
            grid: { color: DARK.grid },
            beginAtZero: true,
          },
          y: {
            ticks: { color: DARK.text, font: { size: 11 } },
            grid: { color: DARK.grid },
          },
        },
      },
    });
  }

  // ── 3. Barras horizontais — Frequência de ODS ────────────────────
  const odsMap = {};
  projetos.forEach((p) => {
    [p.ods1, p.ods2, p.ods3].filter(Boolean).forEach((o) => {
      const key = "ODS " + o;
      odsMap[key] = (odsMap[key] || 0) + 1;
    });
  });
  // Ordena numericamente
  const odsLabels = Object.keys(odsMap).sort((a, b) => {
    return parseInt(a.replace("ODS ", "")) - parseInt(b.replace("ODS ", ""));
  });
  const odsCores = odsLabels.map(
    (_, i) => CHART_COLORS[i % CHART_COLORS.length],
  );

  const el3 = document.getElementById("odsChart");
  if (el3) {
    _destroyIfExists("odsChart");
    new Chart(el3, {
      type: "bar",
      data: {
        labels: odsLabels,
        datasets: [
          {
            label: "Projetos",
            data: odsLabels.map((k) => odsMap[k]),
            backgroundColor: odsCores,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            ...DARK.tooltip,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.parsed.x} projeto${ctx.parsed.x !== 1 ? "s" : ""}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: DARK.text, stepSize: 1 },
            grid: { color: DARK.grid },
            beginAtZero: true,
          },
          y: {
            ticks: { color: DARK.textBold, font: { size: 12 } },
            grid: { color: DARK.grid },
          },
        },
      },
    });
  }
  _legInline(
    "legend-ods",
    odsLabels,
    odsCores,
    odsLabels.map((k) => odsMap[k]),
    (v) => v + (v === 1 ? " projeto" : " projetos"),
  );

  // ── 4. Rosca — Natureza das iniciativas ──────────────────────────
  const natMap = {};
  projetos.forEach((p) => {
    const n = (p.natureza || "Não informado").trim();
    natMap[n] = (natMap[n] || 0) + 1;
  });
  const natLabels = Object.keys(natMap);
  const natCores = ["#3498db", "#ffd700", "#2ecc71", "#e67e22", "#9b59b6"];

  const el4 = document.getElementById("naturezaChart");
  if (el4) {
    _destroyIfExists("naturezaChart");
    new Chart(el4, {
      type: "doughnut",
      data: {
        labels: natLabels,
        datasets: [
          {
            data: natLabels.map((k) => natMap[k]),
            backgroundColor: natCores.slice(0, natLabels.length),
            borderColor: "#151b35",
            borderWidth: 4,
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { display: false },
          tooltip: {
            ...DARK.tooltip,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.label}: ${ctx.parsed} projeto${ctx.parsed !== 1 ? "s" : ""}`,
            },
          },
        },
      },
    });
  }
  _legInline(
    "legend-natureza",
    natLabels,
    natCores,
    natLabels.map((k) => natMap[k]),
    (v) => v + (v === 1 ? " projeto" : " projetos"),
  );

  // ── 5. Radar — Projetos por área primária ─────────────────────────
  const areaMap = {};
  projetos.forEach((p) => {
    const a = (p.areaPrimaria || p.area_primaria || "Sem área").trim();
    if (a) areaMap[a] = (areaMap[a] || 0) + 1;
  });
  const areaLabels = Object.keys(areaMap);
  makeRadar(
    "areaChart",
    areaLabels,
    areaLabels.map((a) => areaMap[a]),
    "Projetos por área",
  );
}

// ── Init impactos.html ────────────────────────────────────────────

async function carregarImpactos() {
  const loadEl = document.getElementById("imp-loading");
  const errEl = document.getElementById("imp-error");
  const errMsgEl = document.getElementById("imp-error-msg");
  const contentEl = document.getElementById("imp-content");

  if (loadEl) loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";

  try {
    const API_BASE = window.ESG_API_URL || "http://localhost:3000";
    const res = await fetch(`${API_BASE}/indicadores`);
    if (!res.ok) throw new Error(`Servidor respondeu com status ${res.status}`);

    const raw = await res.json();
    const projetos = (Array.isArray(raw) ? raw : [])
      .map(_mapServerRow)
      .filter((p) => p.titulo || p.empresa);

    if (!projetos.length)
      throw new Error("Nenhum dado encontrado no servidor.");

    if (loadEl) loadEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";

    _todosProj = projetos;
    _paginaAtual = 1;
    _modoVerTodos = false;

    _renderPagina(1);
    setTimeout(() => _renderInfoPill(projetos.length), 50);
    _renderGraficosImpactos(projetos);
  } catch (err) {
    if (loadEl) loadEl.style.display = "none";
    if (errEl) errEl.style.display = "flex";
    if (errMsgEl)
      errMsgEl.textContent = `Não foi possível carregar os dados: ${err.message}`;
  }
}

// ══════════════════════════════════════════════════════════════════
//  Mapeamento back-end → front-end
//  O servidor retorna campos em snake_case (schema Prisma); o front
//  usa camelCase. Esta função faz a tradução.
// ══════════════════════════════════════════════════════════════════

function _mapServerRow(row) {
  // Campos snake_case vindos do Prisma/servidor
  const _titulo = row.titulo_desafio || row.titulo || "";
  const _descDesafio = row.descricao_desafio || "";
  const _areaPrim = row.area_primaria || "";
  const _areaSec = row.area_secundaria || "";
  const _ods1 = row.ods_1 != null ? String(row.ods_1) : "";
  const _ods2 = row.ods_2 != null ? String(row.ods_2) : "";
  const _ods3 = row.ods_3 != null ? String(row.ods_3) : "";
  const _direto = Number(row.impacto_social_direto_num) || 0;
  const _indireto = Number(row.impacto_social_indireto_num) || 0;

  return {
    // ── snake_case: mantido para compatibilidade com o back-end ──
    postado: row.postado || "",
    tipo: row.tipo || "",
    empresa: row.empresa || "",
    responsavel: row.responsavel || "",
    email: row.email || "",
    titulo_desafio: _titulo,
    descricao_desafio: _descDesafio,
    descricao: row.descricao || "",
    area_primaria: _areaPrim,
    area_secundaria: _areaSec,
    resumo: row.resumo || "",
    ods_1: _ods1,
    ods_2: _ods2,
    ods_3: _ods3,
    impacto_social_direto_num: _direto,
    impacto_social_indireto_num: _indireto,
    eixo: row.eixo || "",
    natureza: row.natureza || "",
    // ── camelCase: consumido por renderIndex, cards, gráficos ──
    titulo: _titulo,
    descricaoDesafio: _descDesafio,
    areaPrimaria: _areaPrim,
    areaSecundaria: _areaSec,
    ods1: _ods1,
    ods2: _ods2,
    ods3: _ods3,
    impactoSocialDireto: _direto,
    impactoSocialIndireto: _indireto,
  };
}

// ══════════════════════════════════════════════════════════════════
//  DOMContentLoaded
// ══════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const fi = document.getElementById("fileInput");
  const dz = document.getElementById("dropZone");
  const po = document.getElementById("popupOverlay");

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

  document.querySelectorAll("nav a").forEach((a) =>
    a.addEventListener("click", () => {
      const m = document.getElementById("menu");
      if (m) m.classList.remove("active");
    }),
  );

  // index.html: busca dados do servidor ao carregar
  if (document.getElementById("upload-inline-wrap")) _iniciarApp();

  // impactos.html: busca dados do servidor
  if (document.getElementById("imp-loading")) carregarImpactos();
});
