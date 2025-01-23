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
        scaleLabel: {
          display: true,
          labelString: '',
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: '',
        },
      },
    },
  },
}

// change this to the id of your chart element in HMTL
const lineCtx = document.getElementById('line')
window.myLine = new Chart(lineCtx, lineConfig)

const countResponsesPerDay = (data) => {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('es-ES', { weekday: 'long' }));
  }
  const countsContado = [0, 0, 0, 0, 0, 0, 0];
  const countsCredito = [0, 0, 0, 0, 0, 0, 0];

  Object.values(data).forEach(record => {
    const savedTime = record.saved;
    const paymentType = record.pago;
    if (!savedTime || !paymentType) {
      return;
    }

    const formattedTime = savedTime.replace('a. m.', 'AM').replace('p. m.', 'PM');
    const dt = new Date(Date.parse(formattedTime.replace(/(\d{2}\/\d{2}\/\d{4}), (\d{2}):(\d{2}):(\d{2}) (AM|PM)/, '$1 $2:$3:$4 $5')));
    const day = (dt.getDay() + 6) % 7; // Adjust day index to match labels array

    if (paymentType === 'contado') {
      countsContado[day]++;
    } else if (paymentType === 'crédito') {
      countsCredito[day]++;
    }
  });

  return { labels, countsContado, countsCredito };
}

const update = () => {
  fetch('/api/v1/landing')
    .then(response => response.json())
    .then(data => {
      let { labels, countsContado, countsCredito } = countResponsesPerDay(data)

      // Reset data
      window.myLine.data.labels = [];
      window.myLine.data.datasets[0].data = [];
      window.myLine.data.datasets[1].data = [];

      // New data
      window.myLine.data.labels = [...labels]
      window.myLine.data.datasets[0].data = [...countsContado]
      window.myLine.data.datasets[1].data = [...countsCredito]

      // Update axis labels
      window.myLine.options.scales.x.scaleLabel.labelString = 'Día de la semana';
      window.myLine.options.scales.y.scaleLabel.labelString = 'Cantidad';

      window.myLine.update();
    })
    .catch(error => console.error('Error:', error));
}

update();
