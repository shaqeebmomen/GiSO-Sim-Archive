import mathHelper from './mathHelper.js'

Chart.defaults.global.elements.point.pointBackgroundColor = "rgba(255,255,255,1)";
Chart.defaults.global.elements.point.pointRadius = "2";
Chart.defaults.global.elements.line.backgroundColor = "rgba(0,0,0,0)";
Chart.defaults.global.elements.line.borderWidth = 2;



// Chart.js

var ctx = document.getElementById('myChart').getContext('2d');

var myLineChart = new Chart(ctx, {

    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Flight',
            data: [],

            borderColor: 'red'
        }]
    },
    options: {
        responsive: false,
        scales: {
            xAxes: [{
                gridLines: {
                    color: 'black',
                    display: true,
                    zeroLineColor: 'black'
                },
                ticks: {
                    padding: 5,
                    min: 3,
                    maxTicksLimit: 11

                }
            }],
            yAxes: [{
                gridLines: {
                    color: 'black',
                    display: true,
                    zeroLineWidth: 1,
                    zeroLineColor: 'black'
                },
                ticks: {
                    padding: 5,

                }
            }]
        },
        animation: {
            duration: 0
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        elements: {
            line: {
                tension: 0
            }
        }
    }
});


const updateChart = (trial, maxPoints) => {
    myLineChart.data.labels = []
    myLineChart.data.datasets[0].data = []


    for (let i = 0; i <= maxPoints; i++) {

        const x = trial.s_x_max * i / maxPoints

        myLineChart.data.labels.push(mathHelper.round(x, 3))
        myLineChart.data.datasets[0].data.push({

            y: mathHelper.round(trial.a * (x) ** 2 + trial.b * (x) + trial.c, 3)
        })
    }
    myLineChart.update();
}

export default {
    updateChart
}