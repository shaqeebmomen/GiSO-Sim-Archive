const mathHelper = require('./mathUtils.js');

const motor = {
    stallTorque: 2.8, // N*m
    freeSpeed: 5 * 60 * 2 * Math.PI, // rad/s
    getTorque: function (speed, ratio) {
        return this.stallTorque * ratio - ((this.stallTorque * ratio) / (this.freeSpeed / ratio) * speed)
    }
}

const accel_g = 9.81 // m/s^2
const den_arm = 2
const mass_load = 2.5 // kg
const h_base = 1 // m
const dt = 0.01 / 1000 // s
const outputPrecision = 50;
const decimals = 6

const stateArrays = {
    theta: [],
    omega: [],
    alpha: [],
    time: [],
    loadTorque: [],
    motorTorque: [],
    torque: [],
    addState: function (newState) {
        for (const key in newState) {
            if (newState.hasOwnProperty(key) && typeof (newState[key]) === 'number') {
                if (key === 'theta' || key === 'omega' || key === 'alpha') {
                    // this[key].push(mathHelper.round(newState[key] * 180 / Math.PI, decimals))
                    this[key].push(mathHelper.round(newState[key] * 180 / Math.PI, decimals))

                }
                else {
                    this[key].push(mathHelper.round(newState[key], decimals))
                }
            }
        }
    },
    clear: function () {
        for (const key in this) {
            if (this.hasOwnProperty(key) && typeof (this[key]) !== 'function') {
                this[key] = [];
            }
        }
    },
    getState: function (index) {
        return {
            theta: this.theta[index],
            omega: this.omega[index],
            alpha: this.alpha[index],
            time: this.time[index],
            torque: this.torque[index],
            loadTorque: this.loadTorque[index],
            motorTorque: this.motorTorque[index]
        }
    },
    getStateTime: function (time) {
        time = mathHelper.round(time, 5)
        index = Math.trunc(time / dt) + 1
    }
}

const angularState = {
    time: 0, // s
    theta: 0, // rad
    omega: 0, // rad/s
    alpha: 0, // rad/s^2
    update: function (dAlpha, dt) {
        this.time += dt
        this.theta += this.omega * dt
        this.omega += this.alpha * dt
        this.alpha = dAlpha

    },
    clear: function (initAlpha) {
        this.time = 0
        this.theta = 0
        this.omega = 0
        this.alpha = initAlpha
    }
}

const getNetTorque = (ratio, length, mass) => {
    let torque_motor = motor.getTorque(angularState.omega, ratio);

    // Calculate load from arm at current angle
    let torque_load = accel_g * length * Math.cos(angularState.theta) * (length * den_arm / 2 + mass);
    // console.log({ torque_motor, torque_load });

    // Net Torque
    return { net: torque_motor - torque_load, load: torque_load, motor: torque_motor }

}


const calcExit = (ratio, angle, length, loadMass = mass_load) => {
    let exit = false;

    const arm_inertia = (length ** 2) * length * den_arm / 3;

    const initAlpha = (motor.getTorque(0, ratio) - (accel_g * length * Math.cos(0) * (length * den_arm / 2 + loadMass))) / arm_inertia
    angularState.clear(initAlpha);
    stateArrays.clear();


    if (getNetTorque(ratio, length, loadMass).net < 0) {

        return { exitOmega: 0, exitHeight: 0 }
    }

    while (!exit) {

        const torques = getNetTorque(ratio, length, loadMass)
        // Net Torque
        let torque_net = torques.net;


        // Net Alpha
        let alpha_net = torque_net / arm_inertia;

        // Update current state
        angularState.update(alpha_net, dt)
        // Add new state to data list
        stateArrays.addState({ ...angularState, torque: torque_net, loadTorque: torques.load, motorTorque: torques.motor })
        // Check if stopped
        // (angularState.theta >= angle)
        if (Math.abs(angularState.theta - angle) < 0.001) {
            // console.log(angularState);
            exit = true;
        }
    }

    // console.log(stateArrays);
    // Motor Calculations Done
    // console.log("Launch Time");
    const launchTime = stateArrays.time[stateArrays.time.length - 1]
    // console.log(launchTime);
    const exitOmega = angularState.omega;
    const exitHeight = h_base + Math.sin(angle) * length;
    const exitAlpha = angularState.alpha;
    const output = { exitOmega, exitHeight, launchTime, exitAlpha, data: stateArrays }

    for (const key in stateArrays) {
        if (stateArrays.hasOwnProperty(key) && typeof (stateArrays[key]) !== 'function') {
            output.data[key] = mathHelper.trim(stateArrays[key], outputPrecision);
        }
    }
    return output
}




module.exports = {
    accel_g,
    motor,
    calcExit,
    angularState,
    mass_load,

}