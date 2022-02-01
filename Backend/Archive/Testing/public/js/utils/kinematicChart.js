import mathHelper from './mathHelper.js'

Chart.defaults.global.elements.point.pointBackgroundColor = "rgba(255,255,255,1)";
Chart.defaults.global.elements.point.pointRadius = "2";
Chart.defaults.global.elements.line.backgroundColor = "rgba(0,0,0,0)";
Chart.defaults.global.elements.line.borderWidth = 2;


class KinematicChart {

    constructor(element, name, color) {
        this.chart = new Chart(element, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: name,
                    data: [],

                    borderColor: color
                }]
            },
            options: {
                responsive: true,
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
    }

    updateChart = (x, y) => {
        const roundedX = []
        const roundedY = []
        for (let i = 0; i < x.length; i++) {
            roundedX.push(mathHelper.round(x[i], 6))
            roundedY.push(mathHelper.round(y[i], 6))
        }
        this.chart.data.labels = roundedX
        this.chart.data.datasets[0].data = roundedY
        this.chart.update();
    }
}





export default {
    KinematicChart
}