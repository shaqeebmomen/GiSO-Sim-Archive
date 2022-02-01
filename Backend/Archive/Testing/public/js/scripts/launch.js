import anim from '../utils/animation.js';
// import motorSim from '../utils/motorSim.js';
import projCalc from '../utils/projectileCalc.js';
// import graph from './graph.js';

const dataForm = document.getElementById("trial-form")

const updateError = (message = "") => {
    document.getElementById("error").innerText = message
}

const updateStats = (exitV = 0, maxDistance = 0, maxHeight = 0) => {
    document.getElementById("exitV").innerText = "Exit V:   " + exitV
    document.getElementById("maxDist").innerText = "Max Distance:   " + maxDistance
    document.getElementById("maxHeight").innerText = "Max Height:   " + maxHeight

}

const validateInputs = () => {
    const ratio = parseFloat(dataForm["ratio-input"].value);
    const angle = parseFloat(dataForm["angle-input"].value); // Deg
    const length = parseFloat(dataForm["length-input"].value);

    const ratioCheck = ratio >= 1 && ratio <= 350
    const angleCheck = angle >= 10 && angle <= 90
    const lengthCheck = length >= 0.5 && length <= 2.0


    return angleCheck && lengthCheck && ratioCheck
}



// dataForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const addTrial = firebase.functions().httpsCallable("addTrial");

//     data = await addTrial({
//         gearRatio: dataForm["ratio-input"].value,
//         releaseAngle: dataForm["angle-input"].value,
//         armLength: dataForm["length-input"].value
//     })

// })





const runSim = async (event) => {
    event.preventDefault();
    updateError()
    updateStats()
    if (validateInputs()) {
        const ratio = parseFloat(dataForm["ratio-input"].value);
        const angle = parseFloat(dataForm["angle-input"].value * Math.PI / 180); //Converted to Rad
        const length = parseFloat(dataForm["length-input"].value);

        const submitLaunch = firebase.functions().httpsCallable("submitLaunch");

        let result = await submitLaunch({
            ratio, angle, length
        })

        console.log(result);
        // console.log(result.data);
        if (result.data.error === undefined) {
            anim.armState.angle = angle
            anim.armState.length = length
            const maxDim = 1.1 * Math.ceil(Math.max(result.data.s_x_max + anim.armState.length, result.data.s_y_max + anim.armState.length + anim.baseArm.height))
            // anim.canvasView.update(Math.ceil(trial.s_x_max + anim.armState.length), Math.ceil(trial.s_y_max + anim.armState.length + anim.baseArm.height))
            anim.canvasView.update(maxDim, maxDim)
            anim.drawPath(2, projCalc.calcPath, result.data)
        }
        else {
            anim.init()
            updateError(result.data.error)
        }

    } else {
        updateError("Angle needs to be between 10-90\nRatio needs to be between 1-350\nLength needs to be between 0.5-2")
    }
}
dataForm.addEventListener("submit", runSim)

// document.getElementById('sim-btn').addEventListener('click', runSim)


anim.armState.length = parseFloat(dataForm["length-input"].value);
anim.canvasView.armView();

anim.init();
anim.drawArm();










