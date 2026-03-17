fetch("http://localhost:5000/projetos")
.then(res => res.json())
.then(dados => {
  console.log(dados);

const projetos = dados.indicadores.map(p => p.projeto);
const impactos = dados.indicadores.map(p => p.impacto);

const totalProjetos = dados.indicadores.length;
const impactoTotal = impactos.reduce((a,b)=>a+b,0);


// -------- GRÁFICO DE PIZZA --------

// contar categorias

const categorias = {};

dados.indicadores.forEach(p => {

if(categorias[p.categoria]){
categorias[p.categoria]++;
}else{
categorias[p.categoria] = 1;
}

});

// Montando o gráfico de pizza

const nomesCategorias = Object.keys(categorias);
const quantidadeCategorias = Object.values(categorias);

const ctxPizza = document.getElementById("graficoPizza");

new Chart(ctxPizza, {
  type: "pie",
  data: {
    labels: nomesCategorias,
    datasets: [{
      data: quantidadeCategorias,
      backgroundColor: [
        "#2ecc71",
        "#3498db",
        "#f1c40f",
        "#e74c3c",
        "#9b59b6"
      ]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true
  }
});

// -------- ODS --------

const odsCount = {};

// conta os ODS
dados.indicadores.forEach(p => {
  if (p.ods) { // evita erro se não tiver ODS
    if (odsCount[p.ods]) {
      odsCount[p.ods]++;
    } else {
      odsCount[p.ods] = 1;
    }
  }
});

const odsOrdenado = Object.entries(odsCount)
  .sort((a, b) => b[1] - a[1]);

const odsLabels = odsOrdenado.map(item => item[0]);
const odsValues = odsOrdenado.map(item => item[1]);

new Chart(document.getElementById("graficoODS"), {
  type: "bar",
  data: {
    labels: odsLabels,
    datasets: [{
      label: "Projetos por ODS",
      data: odsValues,
      backgroundColor: "#10B981",
      borderRadius: 8 
    }]
  },
  options: {
    indexAxis: 'y', 
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }
});

// -------- RADAR ÁREAS --------

const areas = {
  "Gestão": 0,
  "TI": 0,
  "Educação": 0,
  "Engenharia": 0,
  "Saúde": 0,
  "Construção": 0,
  "Direito": 0
};

dados.indicadores.forEach(p => {
  if (areas[p.area] !== undefined) {
    areas[p.area]++;
  }
});

new Chart(document.getElementById("graficoRadar"), {
  type: "radar",
  data: {
    labels: Object.keys(areas),
    datasets: [{
      label: "Projetos por Área",
      data: Object.values(areas),
      
      backgroundColor: "rgba(52, 152, 219, 0.2)", // azul transparente
      borderColor: "#3498db",
      borderWidth: 2,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#3498db"
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,

    plugins: {
      legend: {
        display: false
      }
    },

    scales: {
      r: {
        beginAtZero: true,

        // Remove a escala do radar
        ticks: {
          display: false
        },

        // Cor das linhas
        grid: {
          color: "rgba(255,255,255,0.1)"
        },

        // Cor dos raios
        angleLines: {
          color: "rgba(255,255,255,0.2)"
        },

        // Cor do texto dos rótulos
        pointLabels: {
          color: "#ffffff",
          font: {
            size: 12
          }
        }
      }
    }
  }
});

// -------- EVOLUÇÃO --------

const anos = {
  "2022": 0,
  "2023": 0,
  "2024": 0,
  "2025": 0,
  "2026": 0
};

dados.indicadores.forEach(p => {
  const ano = p.data.substring(0,4);
  if (anos[ano] !== undefined) {
    anos[ano]++;
  }
});

new Chart(document.getElementById("graficoLinha"), {
  type: "line",
  data: {
    labels: Object.keys(anos),
    datasets: [{
      label: "Projetos por Ano",
      data: Object.values(anos)
    }]
  }
});

});
