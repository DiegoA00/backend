/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Contado',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [],
        fill: false,
      },
      {
        label: 'Crédito',
        fill: false,
        backgroundColor: '#7e3af2',
        borderColor: '#7e3af2',
        data: [],
      },
    ],
  },
  options: {
    responsive: true,
    legend: {
      display: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Últimos 7 días',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cantidad de Respuestas',
        },
      },
    },
  },
};

const lineCtx = document.getElementById('line');
window.myLine = new Chart(lineCtx, lineConfig);

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

const countResponsesPerDay = (data) => {
  const last7Days = getLast7Days();
  const labels = last7Days.map(d => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
  const countsContado = new Array(7).fill(0);
  const countsCredito = new Array(7).fill(0);

  Object.values(data).forEach(record => {
    const { pago, saved } = record;
    if (!pago || !saved) return;

    const [datePart] = saved.split(",");
    const [day, month, year] = datePart.trim().split("/");
    const dt = new Date(+year, +month - 1, +day);

    const index = last7Days.findIndex(d => d.toDateString() === dt.toDateString());
    if (index === -1) return;

    pago.toLowerCase() === 'contado' ? countsContado[index]++ : countsCredito[index]++;
  });

  return { labels, countsContado, countsCredito };
};

const updateLine = () => {
  fetch('/api/v1/landing')
    .then(response => response.json())
    .then(data => {
      const { labels, countsContado, countsCredito } = countResponsesPerDay(data);
      window.myLine.data.labels = labels;
      window.myLine.data.datasets[0].data = countsContado;
      window.myLine.data.datasets[1].data = countsCredito;
      window.myLine.update();
    })
    .catch(error => console.error('Error:', error));
};

updateLine();
