const fontStyles = {
    fontFamily: "'Roboto', sans-serif",
    fontColor: "white",
    fontSize: 20,
    fontStyle: "bold",
    padding: 2,
};

export default {
    responsive: true,
    maintainAspectRatio: false,
    title: {
        display: true,
        text: "Lift Results",
        ...fontStyles,
    },
    layout: {
        padding: {
            top: 15
        },
    },
    legend: {
        position: "top",
        labels: {
            ...fontStyles,
            fontSize: 14,
            padding: 30,
            boxWidth: 20,
            usePointStyle: true
        },
        display: true,
    },
    tooltips: {
        titleFontFamily: "'Roboto', sans-serif",
        titleFontColor: "white",
        titleFontSize: 20,
        titleFontStyle: "bold",
        bodyFontFamily: "'Roboto', sans-serif",
        bodyFontColor: "white",
        bodyFontSize: 20,
    },
    scales: {
        xAxes: [
            {
                scaleLabel: {
                    display: true,
                    // labelString: this.xLabel,
                    ...fontStyles,
                },
                gridLines: {
                    color: "white",
                    display: true,
                    lineWidth: 1,
                    zeroLineWidth: 3,
                    zeroLineColor: "white",
                },
                ticks: {
                    padding: 5,
                    min: 3,
                    maxTicksLimit: 11,
                    fontColor: "white",
                },
            },
        ],
        yAxes: [
            {
                type: "linear",
                position: "left",
                // id: "kinematics",
                gridLines: {
                    color: "white",
                    display: true,
                    lineWidth: 2,
                    zeroLineWidth: 2,
                    zeroLineColor: "white",
                },
                scaleLabel: {
                    display: true,
                    // labelString: this.yLabel,
                    ...fontStyles,
                    // fontSize: 15,
                },
                ticks: {
                    padding: 5,
                    fontColor: "white",
                },
            },
            // {
            //   type: "linear",
            //   position: "right",
            //   id: "dynamics",
            //   gridLines: {
            //     // color: 'black',
            //     // display: true,
            //     // zeroLineWidth: 1,
            //     // zeroLineColor: 'black'
            //     drawOnChartArea: false,
            //   },
            //   scaleLabel: {
            //     display: true,
            //     labelString: "Nm",
            //     ...fontStyles,
            //     fontSize: 15,
            //   },
            //   ticks: {
            //     padding: 5,
            //     fontColor: "white",
            //   },
            // },
        ],
    },
    animation: {
        duration: 800,
    },
    hover: {
        animationDuration: 800, // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 800, // animation duration after a resize
    elements: {
        line: {
            tension: 0,
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: 3,
        },
        point: {
            pointBackgroundColor: "rgba(255,255,255,1)",
            radius: 5,
            hitRadius: 2,
        },
    },
}