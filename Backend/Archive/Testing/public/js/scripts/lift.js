import anim from '../utils/animation.js';
import kinematicChart from '../utils/kinematicChart.js'
import mathHelper from '../utils/mathHelper.js';
// console.log(regression);



const thetaChart = document.getElementById("thetaChart");
const omegaChart = document.getElementById("omegaChart");
const alphaChart = document.getElementById("alphaChart");
const torqueChart = document.getElementById("torqueChart");
const loadChart = document.getElementById("loadChart");
const motorChart = document.getElementById("motorChart");

const dataForm = document.getElementById("trial-form")

const thetaGraph = new kinematicChart.KinematicChart(thetaChart, 'Theta (deg)', 'red')
const omegaGraph = new kinematicChart.KinematicChart(omegaChart, 'Omega (deg/s)', 'green')
const alphaGraph = new kinematicChart.KinematicChart(alphaChart, 'Alpha (deg/s^2)', 'blue')
const torqueGraph = new kinematicChart.KinematicChart(torqueChart, 'Net Torque (Nm)', 'black')
const loadGraph = new kinematicChart.KinematicChart(loadChart, 'Load Torque (Nm)', 'brown')
const motorGraph = new kinematicChart.KinematicChart(motorChart, 'Motor Torque (Nm)', 'cyan')




const updateError = (message = "") => {
    document.getElementById("error").innerText = message
}

const updateStats = (exitV = 0, maxDistance = 0, maxHeight = 0) => {
    document.getElementById("exitV").innerText = "Exit V:   " + exitV
    document.getElementById("maxDist").innerText = "Max Distance:   " + maxDistance
    document.getElementById("maxHeight").innerText = "Max Height:   " + maxHeight

}

const updateStatsLift = (liftTime = 0, finalOmega = 0, finalAlpha = 0) => {
    document.getElementById("liftTime").innerText = "Lift Time:   " + liftTime
    document.getElementById("finalOmega").innerText = "Final Angular V:   " + finalOmega
    document.getElementById("finalAlpha").innerText = "Final Angular A:   " + finalAlpha

}

const validateInputs = () => {
    const ratio = parseFloat(dataForm["ratio-input"].value);
    const angle = parseFloat(dataForm["angle-input"].value); // Deg
    const length = parseFloat(dataForm["length-input"].value);
    const mass = parseFloat(dataForm["weight-input"].value);

    const ratioCheck = ratio >= 1 && ratio <= 350
    const angleCheck = angle >= 10 && angle <= 90
    const lengthCheck = length >= 0.5 && length <= 2.0
    const massCheck = mass >= 0.1 && mass <= 100


    return angleCheck && lengthCheck && ratioCheck && massCheck
}




const runSim = async (event) => {
    if (event) {
        event.preventDefault();
    }

    updateError()
    updateStatsLift()
    if (validateInputs()) {
        const ratio = parseFloat(dataForm["ratio-input"].value);
        const angle = parseFloat(dataForm["angle-input"].value * Math.PI / 180); //Converted to Rad
        const length = parseFloat(dataForm["length-input"].value);
        const weight = parseFloat(dataForm["weight-input"].value);
        const precision = parseFloat(dataForm["precision-input"].value);
        const submitLift = firebase.functions().httpsCallable("submitLift");
        let results;
        if (weight) {
            results = await submitLift({ ratio, angle, length, precision, weight })
        }
        else {
            results = await submitLift({ ratio, angle, length, precision })

        }
        // console.log(results);

        const { exitOmega, exitAlpha, launchTime } = results.data
        if (results.data.error === undefined) {

            updateStatsLift(mathHelper.round(launchTime, 4), mathHelper.round(exitOmega, 4), mathHelper.round(exitAlpha, 4))
            anim.armState.angle = angle
            anim.armState.length = length
            anim.canvasView.armView();
            anim.launch(angle, 1)
            const graphParams = { ...results.data.data }
            thetaGraph.updateChart(graphParams.time, graphParams.theta)
            omegaGraph.updateChart(graphParams.time, graphParams.omega)
            alphaGraph.updateChart(graphParams.time, graphParams.alpha)
            torqueGraph.updateChart(graphParams.time, graphParams.torque)
            loadGraph.updateChart(graphParams.time, graphParams.loadTorque)
            motorGraph.updateChart(graphParams.time, graphParams.motorTorque)
        } else {
            anim.init()
            updateError(result.data.error)
        }
    } else {
        updateError("Angle needs to be between 10-90\nRatio needs to be between 1-350\nLength needs to be between 0.5-2\nLoad Mass needs to be between 0.1-100")
    }

}

dataForm.addEventListener("submit", runSim)
anim.armState.length = parseFloat(dataForm["length-input"].value);
anim.canvasView.armView();

anim.init();
anim.drawArm();

// const arr = []
// const points = 40
// for (let i = 0; i <= points; i++) {
//     arr.push(i)
// }
// console.log("arr");
// console.log(arr);
// trim(arr, 4)














