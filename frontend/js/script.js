const API_URL = "http://localhost:5000/projetos";

// ── Dados de pesquisa locais ──────────────────
const PESQUISA = {
  "Horta Comunitária": {
    icone: "🌱",
    cor: "#2ecc71",
    resumo:
      "Cultivo coletivo de alimentos orgânicos em áreas urbanas ociosas, fortalecendo a segurança alimentar.",
    detalhes:
      "Hortas comunitárias ajudam a reduzir o impacto do aquecimento global, previnem a erosão do solo, evitam o descarte incorreto do lixo orgânico e mantêm o solo permeável à chuva. Além disso, promovem desenvolvimento econômico e social com geração de renda.",
    beneficios: [
      "Redução do impacto do aquecimento global",
      "Prevenção da erosão do solo",
      "Evita descarte incorreto de lixo orgânico",
      "Geração de renda em territórios vulneráveis",
    ],
    fontes: [
      {
        texto: "Invivo – Hortas Comunitárias",
        url: "https://www.invivo.fiocruz.br/sustentabilidade/hortas-comunitaria/",
      },
      {
        texto: "Pacto Contra a Fome",
        url: "https://pactocontrafome.org/horta-comunitaria-alternativa-para-combater-a-fome-nas-cidades/",
      },
    ],
  },
  "Capacitação Profissional": {
    icone: "🎓",
    cor: "#ffd700",
    resumo:
      "Formação profissional gratuita para jovens em vulnerabilidade socioeconômica.",
    detalhes:
      "Programas de formação continuada, oficinas e parcerias com universidades têm impacto direto: jovens mais confiantes para empreender, famílias com acesso digital a serviços de saúde e cidadãos aptos a usar serviços públicos online.",
    beneficios: [
      "Jovens mais confiantes para empreender",
      "Acesso a serviços de saúde digitais",
      "Fortalecimento da autonomia profissional",
      "Ciclo de desenvolvimento social sustentável",
    ],
    fontes: [
      {
        texto: "NG Brasil – Inclusão Digital",
        url: "https://www.ong.ng-brasil.com/nosso-trabalho/inclusao-digital-ampliar-acesso-reduzir-desigualdades-brasil/",
      },
      {
        texto: "CESAR – Empregabilidade Jovem",
        url: "https://www.cesar.org.br/w/empregabilidade-jovem-impacto-social-com-inclusao-digital",
      },
    ],
  },
  "Reciclagem Urbana": {
    icone: "♻️",
    cor: "#3498db",
    resumo:
      "Coleta seletiva integrada e destinação correta de resíduos sólidos urbanos.",
    detalhes:
      "Em 2022 o Brasil atingiu 25,6% de reciclagem plástica. O país produz 90 mi de toneladas de lixo/ano mas recicla apenas 7,5%. Estima-se perda de R$ 120 bilhões anuais pelo descarte inadequado de recicláveis.",
    beneficios: [
      "Brasil atingiu 25,6% de reciclagem plástica",
      "Redução de resíduos em aterros sanitários",
      "Economia de recursos naturais",
      "Potencial de recuperar R$ 120 bilhões/ano",
    ],
    fontes: [
      {
        texto: "MundoIsopor – Impactos da Reciclagem",
        url: "https://www.mundoisopor.com.br/sustentabilidade/impactos-da-reciclagem-na-sociedade-e-na-economia",
      },
      {
        texto: "Embrapa – Reciclagem no Brasil",
        url: "https://www.embrapa.br/busca-de-noticias/-/noticia/98943487/coleta-deficiente-e-baixa-reciclagem-ainda-sao-desafios-para-gestao-do-lixo-no-brasil",
      },
    ],
  },
  "Inclusão Digital": {
    icone: "💻",
    cor: "#9b59b6",
    resumo:
      "Democratização do acesso à tecnologia e à internet para comunidades periféricas.",
    detalhes:
      "84% dos brasileiros usam internet, mas 30 milhões ainda não têm acesso. Entre os conectados, 57% têm conexão precária. A exclusão digital limita oportunidades educacionais e profissionais, perpetuando desigualdades.",
    beneficios: [
      "Combate à exclusão dos 30 milhões sem acesso",
      "Redução de conexões precárias",
      "Ampliação de oportunidades educacionais",
      "Combate à desigualdade social",
    ],
    fontes: [
      {
        texto: "EqualWeb – Inclusão Digital no Brasil",
        url: "https://equalweb.com.br/a-importancia-da-inclusao-digital-no-brasil/",
      },
      {
        texto: "PUCRS – Inclusão e Mobilidade Social",
        url: "https://online.pucrs.br/blog/inclusao-digital-mobilidade-social",
      },
    ],
  },
  "Plantio de Árvores": {
    icone: "🌳",
    cor: "#27ae60",
    resumo:
      "Reflorestamento urbano com espécies nativas para melhoria do microclima.",
    detalhes:
      "A vegetação urbana pode refrescar em até 5°C regiões densamente urbanizadas. Segundo a FAO, árvores poderiam reduzir a temperatura das cidades em até 8°C, diminuindo o uso de ar-condicionado e emissões relacionadas em até 40%.",
    beneficios: [
      "Redução de até 5°C na temperatura local",
      "FAO: cidades podem ser resfriadas em até 8°C",
      "Redução do uso de ar-condicionado em 40%",
      "Fortalecimento da biodiversidade urbana",
    ],
    fontes: [
      {
        texto: "Painel de Mudanças Climáticas",
        url: "https://paineldemudancasclimaticas.org.br/noticia/arborizacao-urbana",
      },
      {
        texto: "ONU Brasil – Árvores nas Cidades",
        url: "https://brasil.un.org/pt-br/83147-onu-meio-ambiente-destaca-benef%C3%ADcios-de-mais-%C3%A1rvores-nas-cidades",
      },
    ],
  },
  "Educação Ambiental": {
    icone: "📚",
    cor: "#1abc9c",
    resumo:
      "Conscientização ecológica para escolas e comunidades, formando cidadãos sustentáveis.",
    detalhes:
      "A educação ambiental é ferramenta essencial para transformar comportamentos individuais e coletivos. Projetos voltados à formação de consciência ecológica desde a infância criam cidadãos comprometidos com a sustentabilidade.",
    beneficios: [
      "Formação de consciência ecológica",
      "Transformação de comportamentos coletivos",
      "Cidadãos comprometidos com o meio ambiente",
      "Educação de qualidade — ODS 4",
    ],
    fontes: [
      {
        texto: "UNESCO – Educação para Sustentabilidade",
        url: "https://www.unesco.org/pt/sustainable-development/education",
      },
      {
        texto: "MEC – Educação Ambiental",
        url: "https://www.gov.br/mec/pt-br",
      },
    ],
  },
  "Oficina de Programação": {
    icone: "👨‍💻",
    cor: "#16a085",
    resumo:
      "Capacitação técnica em programação para jovens em situação de vulnerabilidade.",
    detalhes:
      "O programa Computadores para Inclusão tornou-se referência internacional integrando recondicionamento de equipamentos, capacitação técnica e doação de computadores a escolas públicas.",
    beneficios: [
      "Referência internacional de inclusão digital",
      "Recondicionamento de equipamentos descartados",
      "Capacitação técnica de jovens vulneráveis",
      "Ampliação de acesso a empregos qualificados",
    ],
    fontes: [
      {
        texto: "Agência Gov – Computadores para Inclusão",
        url: "https://agenciagov.ebc.com.br/noticias/202603/programa-brasileiro-de-inclusao-digital-vira-referencia-internacional-e-pode-ser-replicado-na-america-do-sul",
      },
      {
        texto: "Strong – Inclusão Digital",
        url: "https://strong.com.br/glossario/o-que-e-inclusao-digital-e-como-ela-influencia-o-mercado-de-trabalho/",
      },
    ],
  },
  "Coleta Seletiva": {
    icone: "🗑️",
    cor: "#2980b9",
    resumo:
      "Ampliação da coleta seletiva urbana reduzindo o descarte inadequado de resíduos.",
    detalhes:
      "A coleta seletiva bem estruturada reduz resíduos em aterros sanitários, gera empregos para catadores e contribui para a economia circular, melhorando a qualidade de vida urbana.",
    beneficios: [
      "Redução de resíduos em aterros",
      "Empregos para catadores",
      "Contribuição para economia circular",
      "Melhoria da qualidade de vida urbana",
    ],
    fontes: [
      {
        texto: "RadiumWeb – Consumo Consciente",
        url: "https://www.radiumweb.com.br/post/consumo-consciente-a-import%C3%A2ncia-da-educa%C3%A7%C3%A3o-financeira-para-uma-sociedade-sustent%C3%A1vel",
      },
      {
        texto: "MGN Consultoria – Sustentabilidade",
        url: "https://mgnconsultoria.com.br/educacao-financeira-e-sustentabilidade/",
      },
    ],
  },
  "Empreendedorismo Local": {
    icone: "💼",
    cor: "#e67e22",
    resumo:
      "Apoio a pequenos empreendedores locais com capacitação, mentorias e acesso a mercado.",
    detalhes:
      "O empreendedorismo local fortalece a economia dos territórios, gerando empregos e distribuindo renda de forma mais equitativa, com impacto direto na redução da pobreza.",
    beneficios: [
      "Fortalecimento da economia local",
      "Geração de empregos e distribuição de renda",
      "Apoio ao MEI",
      "Redução da pobreza",
    ],
    fontes: [
      { texto: "Sebrae – Empreendedorismo", url: "https://www.sebrae.com.br" },
      {
        texto: "IBGE – Micro e Pequenas Empresas",
        url: "https://www.ibge.gov.br",
      },
    ],
  },
  "Alfabetização Adultos": {
    icone: "📖",
    cor: "#8e44ad",
    resumo:
      "Alfabetização e letramento para adultos, garantindo acesso básico à educação.",
    detalhes:
      "O analfabetismo entre adultos representa uma barreira para o exercício da cidadania e inserção no mercado de trabalho. Programas de alfabetização têm impacto direto na autoestima e autonomia dos indivíduos.",
    beneficios: [
      "Superação de barreira para cidadania",
      "Melhora na autoestima e autonomia",
      "Maior participação social",
      "Inserção mais qualificada no mercado",
    ],
    fontes: [
      {
        texto: "UNESCO – Alfabetização de Adultos",
        url: "https://www.unesco.org/pt/literacy",
      },
      {
        texto: "MEC – Brasil Alfabetizado",
        url: "https://www.gov.br/mec/pt-br",
      },
    ],
  },
  "Limpeza de Praias": {
    icone: "🏖️",
    cor: "#f39c12",
    resumo: "Mutirões de limpeza costeira protegendo ecossistemas marinhos.",
    detalhes:
      "A poluição dos oceanos afeta a biodiversidade marinha e a saúde das populações costeiras. Mutirões mobilizam a comunidade e geram dados sobre resíduos descartados, alinhados ao ODS 14.",
    beneficios: [
      "Proteção da biodiversidade marinha",
      "Mobilização comunitária",
      "Dados sobre resíduos descartados",
      "Preservação de ecossistemas costeiros",
    ],
    fontes: [
      {
        texto: "ONU Meio Ambiente – Oceanos",
        url: "https://www.unep.org/pt-br",
      },
      { texto: "Instituto Oceanográfico USP", url: "https://www.io.usp.br" },
    ],
  },
  "Distribuição de Alimentos": {
    icone: "🍱",
    cor: "#e74c3c",
    resumo: "Distribuição de alimentos para famílias em insegurança alimentar.",
    detalhes:
      "A insegurança alimentar afeta milhões de brasileiros, com impacto no desenvolvimento infantil e na produtividade. Programas de distribuição complementam políticas públicas garantindo alimentação básica digna.",
    beneficios: [
      "Acesso à alimentação para famílias vulneráveis",
      "Impacto no desenvolvimento infantil",
      "Complementação de políticas públicas",
      "Alinhamento ao ODS 2 — Fome Zero",
    ],
    fontes: [
      {
        texto: "FAO Brasil – Segurança Alimentar",
        url: "https://www.fao.org/brasil/pt/",
      },
      {
        texto: "Rede Penssan – Insegurança Alimentar",
        url: "https://olheparaafome.com.br",
      },
    ],
  },
  "Energia Solar": {
    icone: "☀️",
    cor: "#f1c40f",
    resumo:
      "Painéis solares em comunidades de baixa renda reduzindo custos e emissões.",
    detalhes:
      "A energia solar reduz custos de eletricidade e contribui para a diminuição de emissões de carbono, democratizando o acesso à energia sustentável e alinhando ao ODS 7.",
    beneficios: [
      "Redução dos custos de energia",
      "Diminuição de emissões de carbono",
      "Democratização da energia sustentável",
      "Independência energética",
    ],
    fontes: [
      { texto: "ANEEL – Energia Solar", url: "https://www.aneel.gov.br" },
      {
        texto: "ABSOLAR – Solar Fotovoltaico",
        url: "https://www.absolar.org.br",
      },
    ],
  },
  "Biblioteca Comunitária": {
    icone: "📚",
    cor: "#3498db",
    resumo:
      "Bibliotecas comunitárias promovendo acesso ao conhecimento e cultura.",
    detalhes:
      "Bibliotecas funcionam como espaços de aprendizado, troca de conhecimento e fortalecimento da identidade cultural local, ampliando a educação para além das escolas formais.",
    beneficios: [
      "Acesso democrático a livros",
      "Espaço de aprendizado comunitário",
      "Fortalecimento da identidade cultural",
      "Educação além das escolas formais",
    ],
    fontes: [
      { texto: "IFLA – Bibliotecas Comunitárias", url: "https://www.ifla.org" },
      { texto: "CFB – Biblioteconomia", url: "https://www.cfb.org.br" },
    ],
  },
  "Assessoria Jurídica": {
    icone: "⚖️",
    cor: "#95a5a6",
    resumo:
      "Orientação jurídica gratuita para populações em situação de vulnerabilidade.",
    detalhes:
      "O acesso à justiça é um direito que frequentemente não chega às populações mais vulneráveis. A assessoria jurídica auxilia em conflitos trabalhistas, moradia, violência doméstica e regularização de documentos.",
    beneficios: [
      "Acesso à justiça para vulneráveis",
      "Orientação em conflitos trabalhistas",
      "Apoio a vítimas de violência doméstica",
      "Regularização de documentos",
    ],
    fontes: [
      { texto: "OAB – Acesso à Justiça", url: "https://www.oab.org.br" },
      {
        texto: "Defensoria Pública SP",
        url: "https://www.defensoria.sp.def.br",
      },
    ],
  },
};

// ── Paleta e metadados ────────────────────────
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

const CAT_META = {
  Ambiental: { cor: "#2ecc71", icone: "🌿" },
  Social: { cor: "#ffd700", icone: "🤝" },
  Educacional: { cor: "#3498db", icone: "📚" },
  Econômico: { cor: "#e67e22", icone: "💼" },
  Saúde: { cor: "#e74c3c", icone: "🏥" },
};

const AREA_IMG = {
  Educação: "../frontend/images/proj_edu.jpeg",
  TI: "../frontend/images/proj_info.jpeg",
  Gestão: "../frontend/images/proj_gestao.jpeg",
  Engenharia: "../frontend/images/proj_eng.jpeg",
  Saúde: "../frontend/images/proj_saude.jpeg",
  Direito: "../frontend/images/proj_direito.jpg",
};

// ── Globais ───────────────────────────────────
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

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${dd}/${["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][+m]}/${y}`;
}

function enriquecer(ind) {
  return ind.map((p) => {
    const q = PESQUISA[p.projeto] || {};
    return { ...p, ...q };
  });
}

// ── Chart defaults ────────────────────────────
function setupCharts() {
  Chart.defaults.color = DARK.text;
  Chart.defaults.borderColor = DARK.grid;
  Chart.defaults.font.family = "'Sora','Segoe UI',sans-serif";
}

function makeBar(id, labels, data, label, colors, horizontal = false) {
  const el = document.getElementById(id);
  if (!el) return;
  return new Chart(el, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: colors,
          borderColor: "transparent",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
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

// ── RENDER INDEX ──────────────────────────────
function renderIndex(ind) {
  setText("stat-total", ind.length);
  setText(
    "stat-impacto",
    ind.reduce((s, p) => s + p.impacto, 0),
  );
  setText("stat-cats", [...new Set(ind.map((p) => p.categoria))].length);

  // Filtros de área (imagens clicáveis)
  const areas = [...new Set(ind.map((p) => p.area))];
  const filtersEl = document.getElementById("area-filters");
  const cardsEl = document.getElementById("cards-portfolio");
  if (!filtersEl || !cardsEl) return;

  let areaAtiva = "todos";

  function renderCards(filtro) {
    areaAtiva = filtro;
    const lista =
      filtro === "todos" ? ind : ind.filter((p) => p.area === filtro);
    cardsEl.innerHTML = "";
    lista.forEach((p, i) => {
      const meta = CAT_META[p.categoria] || { cor: "#888", icone: "📌" };
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("data-aos", "fade-up");
      card.setAttribute("data-aos-duration", "500");
      card.setAttribute("data-aos-delay", String(Math.min(i * 50, 300)));
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front" style="border-color:${color}44;">
            <small>${meta.icone} ${p.categoria}</small>
            <span class="card-proj-name">${p.icone || ""} ${p.projeto}</span>
            <span class="card-num" style="color:${color};">${p.impacto}</span>
          </div>
          <div class="card-back">
            <strong>Área: ${p.area}</strong>
            ${p.ods}<br>
            <small style="opacity:.7;">${formatDate(p.data)}</small>
          </div>
        </div>`;
      cardsEl.appendChild(card);
    });
    // Highlight botão ativo
    filtersEl.querySelectorAll(".area-filter-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.area === filtro);
    });
    // Notifica AOS dos novos elementos
    if (typeof AOS !== "undefined") AOS.refresh();
  }

  // Botão "Todos"
  const btnTodos = document.createElement("button");
  btnTodos.className = "area-filter-btn active";
  btnTodos.dataset.area = "todos";
  btnTodos.setAttribute("data-aos", "zoom-in");
  btnTodos.setAttribute("data-aos-duration", "550");
  btnTodos.setAttribute("data-aos-delay", "0");
  btnTodos.innerHTML = `
    <div class="area-img-wrap" style="background:linear-gradient(135deg,#1f2b6c,#263380);">
      <div class="area-img-overlay">
        <span class="area-img-label">Todos</span>
        <span class="area-img-count">${ind.length} projetos</span>
      </div>
    </div>`;
  btnTodos.onclick = () => renderCards("todos");
  filtersEl.appendChild(btnTodos);

  areas.forEach((area, idx) => {
    const count = ind.filter((p) => p.area === area).length;
    const img = AREA_IMG[area] || "";
    const btn = document.createElement("button");
    btn.className = "area-filter-btn";
    btn.dataset.area = area;
    btn.setAttribute("data-aos", "zoom-in");
    btn.setAttribute("data-aos-duration", "550");
    btn.setAttribute("data-aos-delay", String(Math.min((idx + 1) * 60, 300)));
    btn.innerHTML = `
      <div class="area-img-wrap">
        <img src="${img}" alt="${area}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="area-img-fallback" style="display:none;">${area[0]}</div>
        <div class="area-img-overlay">
          <span class="area-img-label">${area}</span>
          <span class="area-img-count">${count} projeto${count > 1 ? "s" : ""}</span>
        </div>
      </div>`;
    btn.onclick = () => renderCards(area);
    filtersEl.appendChild(btn);
  });

  renderCards("todos");

  // KPIs
  const kpiRow = document.getElementById("kpi-row");
  if (kpiRow) {
    const cats = [...new Set(ind.map((p) => p.categoria))];
    kpiRow.innerHTML = [
      ...cats.map((cat, i) => {
        const m = CAT_META[cat] || { cor: "#888", icone: "📌" };
        const pts = ind
          .filter((p) => p.categoria === cat)
          .reduce((s, p) => s + p.impacto, 0);
        return `<div class="kpi-card" style="border-color:${m.cor}33;" data-aos="zoom-in" data-aos-duration="550" data-aos-delay="${i * 80}"><span class="kpi-icon">${m.icone}</span><span class="kpi-num" style="color:${m.cor};">${pts}</span><span class="kpi-label">pts ${cat}</span></div>`;
      }),
      `<div class="kpi-card" style="border-color:#ffd70033;" data-aos="zoom-in" data-aos-duration="550" data-aos-delay="${cats.length * 80}"><span class="kpi-icon">🏆</span><span class="kpi-projeto">${ind.reduce((a, b) => (b.impacto > a.impacto ? b : a)).projeto}</span><span class="kpi-label">Maior Impacto</span></div>`,
    ].join("");
  }

  setupCharts();

  const anos = {};
  ind.forEach((p) => {
    const a = p.data.substring(0, 4);
    anos[a] = (anos[a] || 0) + 1;
  });
  const anosOrd = Object.keys(anos).sort();
  makeLine(
    "graficoLinha",
    anosOrd,
    anosOrd.map((a) => anos[a]),
    "Projetos por Ano",
  );

  const odsCount = {};
  ind.forEach((p) => {
    if (p.ods) odsCount[p.ods] = (odsCount[p.ods] || 0) + 1;
  });
  const odsOrd = Object.entries(odsCount).sort((a, b) => b[1] - a[1]);
  makeBar(
    "graficoODS",
    odsOrd.map((e) => e[0]),
    odsOrd.map((e) => e[1]),
    "Projetos por ODS",
    odsOrd.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
    true,
  );

  const catCount = {};
  ind.forEach((p) => {
    catCount[p.categoria] = (catCount[p.categoria] || 0) + 1;
  });
  const catLabels = Object.keys(catCount);
  makePie(
    "graficoPizza",
    catLabels,
    catLabels.map((c) => catCount[c]),
    catLabels.map((c) => (CAT_META[c] || { cor: "#888" }).cor),
  );

  const areasDef = [
    "Gestão",
    "TI",
    "Educação",
    "Engenharia",
    "Saúde",
    "Direito",
  ];
  const areaCount = {};
  areasDef.forEach((a) => {
    areaCount[a] = 0;
  });
  ind.forEach((p) => {
    if (areaCount[p.area] !== undefined) areaCount[p.area]++;
  });
  makeRadar(
    "graficoRadar",
    areasDef,
    areasDef.map((a) => areaCount[a]),
    "Projetos por Área",
  );

  makeBar(
    "graficoImpacto",
    ind.map((p) => p.projeto),
    ind.map((p) => p.impacto),
    "Pontos de Impacto",
    ind.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
    false,
  );

  // Notifica AOS de todos os elementos criados dinamicamente
  if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
}

// ── RENDER IMPACTOS ───────────────────────────
function renderImpactos(ind) {
  const lista = document.getElementById("impactos-lista");
  if (!lista) return;

  ind.forEach((p, idx) => {
    const q = PESQUISA[p.projeto] || {};
    const cor = q.cor || "#1f2b6c";
    const icone = q.icone || "📌";
    const odsArr = [p.ods].filter(Boolean);
    const sec = document.createElement("section");
    sec.className = "impacto-section";
    sec.setAttribute("data-aos", "fade-up");
    sec.setAttribute("data-aos-duration", "550");
    sec.setAttribute("data-aos-delay", String(Math.min(idx * 60, 200)));
    sec.innerHTML = `
      <div class="impacto-sec-header" style="border-left:5px solid ${cor};">
        <div class="impacto-sec-top">
          <span class="impacto-icone">${icone}</span>
          <div>
            <span class="impacto-cat-badge" style="background:${cor}22;color:${cor};border:1px solid ${cor}44;">${p.categoria}</span>
            <h2 class="impacto-titulo">${p.projeto}</h2>
          </div>
          <div class="impacto-num-wrap">
            <span class="impacto-pts">${p.impacto}</span>
            <span class="impacto-pts-label">impacto social</span>
          </div>
        </div>
      </div>
      <div class="impacto-sec-body">
        <div class="impacto-texto">
          <p class="impacto-resumo-txt">${q.resumo || ""}</p>
          <p>${q.detalhes || p.descricao || "Sem descrição disponível."}</p>
        </div>
        <div class="impacto-beneficios">
          <h4>Principais Impactos</h4>
          <ul>${(q.beneficios || []).map((b) => `<li>${b}</li>`).join("")}</ul>
          <div class="impacto-ods-wrap">${odsArr.map((o) => `<span class="ods-tag">${o}</span>`).join("")}</div>
        </div>
      </div>`;
    lista.appendChild(sec);
  });

  // Legenda
  const cats = {};
  ind.forEach((p) => {
    cats[p.categoria] = (cats[p.categoria] || 0) + p.impacto;
  });
  const legendEl = document.getElementById("legend-categorias");
  if (legendEl) {
    legendEl.innerHTML = Object.entries(cats)
      .map(
        ([cat, val]) =>
          `<div class="legend-item"><span class="legend-dot" style="background:${(CAT_META[cat] || { cor: "#999" }).cor};"></span><span>${cat} — ${val} pontos</span></div>`,
      )
      .join("");
  }

  setupCharts();
  makePie(
    "categoriaChart",
    Object.keys(cats),
    Object.values(cats),
    Object.keys(cats).map((c) => (CAT_META[c] || { cor: "#888" }).cor),
  );
  makeBar(
    "impactosBar",
    ind.map((p) => p.projeto),
    ind.map((p) => p.impacto),
    "Impacto",
    ind.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
    true,
  );

  // Ticker de bibliografia — duplica os itens para loop contínuo
  const bibEl = document.getElementById("bibliografia-lista");
  if (bibEl) {
    let num = 1;
    const itens = [];
    ind.forEach((p) => {
      (PESQUISA[p.projeto] || {}).fontes?.forEach((f) => {
        itens.push(`<div class="bib-ticker-item">
          <span class="bib-ticker-num">[${num++}]</span>
          <span class="bib-ticker-proj">${p.projeto}</span>
          <a class="bib-ticker-link" href="${f.url}" target="_blank" rel="noopener">${f.texto}</a>
        </div>`);
      });
    });
    // Duplica para loop infinito suave
    bibEl.innerHTML = itens.join("") + itens.join("");
  }

  // Notifica AOS dos elementos dinâmicos
  if (typeof AOS !== "undefined") setTimeout(() => AOS.refresh(), 100);
}

// ── FETCH ─────────────────────────────────────
function _fetch(loadEl, errEl, errMsgEl, contentEl, renderFn) {
  if (!loadEl) return;
  loadEl.style.display = "flex";
  if (errEl) errEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";
  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((dados) => {
      const ind = enriquecer(dados.indicadores || dados);
      loadEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
      renderFn(ind);
    })
    .catch((err) => {
      loadEl.style.display = "none";
      if (errEl) errEl.style.display = "flex";
      if (errMsgEl)
        errMsgEl.textContent = `Não foi possível conectar à API. (${err.message})`;
    });
}

function carregarDados() {
  _fetch(
    document.getElementById("loading-state"),
    document.getElementById("error-state"),
    document.getElementById("error-msg"),
    document.getElementById("main-content"),
    renderIndex,
  );
}
function carregarImpactos() {
  _fetch(
    document.getElementById("imp-loading"),
    document.getElementById("imp-error"),
    document.getElementById("imp-error-msg"),
    document.getElementById("imp-content"),
    renderImpactos,
  );
}

// ── Init ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("nav a")
    .forEach((a) =>
      a.addEventListener("click", () =>
        document.getElementById("menu").classList.remove("active"),
      ),
    );
  if (document.getElementById("loading-state")) carregarDados();
  if (document.getElementById("imp-loading")) carregarImpactos();
});
