import mathHelper from './mathHelper.js';

const accel_g = 9.81


const calcParams = (exitOmega, exitHeight, angle, length) => {
    const v_x_o = exitOmega * length * Math.cos(angle)
    const v_y_o = exitOmega * length * Math.sin(angle)

    const flightIntercepts = []

    flightIntercepts[0] = (-v_y_o + Math.sqrt(v_y_o ** 2 - 4 * (-0.5 * accel_g) * exitHeight)) / (2 * (-0.5 * accel_g))
    flightIntercepts[1] = (-v_y_o - Math.sqrt(v_y_o ** 2 - 4 * (-0.5 * accel_g) * exitHeight)) / (2 * (-0.5 * accel_g))

    const flightTime = Math.max(...flightIntercepts)

    const v_y_f = v_y_o - flightTime * accel_g;

    const h_max = exitHeight + v_y_o ** 2 / (2 * accel_g);

    const s_x_f = flightTime * v_x_o;

    const equationParams = {
        // general form for quadratic eq: y = ax^2 + bx + c
        // formulas for a, b, c derived from relating parametric equations
        a: mathHelper.round(0.5 * (-accel_g) / v_x_o ** 2, 3),
        b: mathHelper.round(v_y_o / v_x_o, 3),
        c: mathHelper.round(exitHeight, 3)
    }

    const trialParams = {
        ...equationParams,
        s_x_max: mathHelper.round(s_x_f, 3),
        v_x: mathHelper.round(v_x_o, 3),
        s_y_max: h_max,
        v_y: [mathHelper.round(v_y_o, 3), mathHelper.round(v_y_f, 3)],
        v_exit: exitOmega * length,
        time: mathHelper.round(flightTime, 3)
    }
    return trialParams
}

const calcPath = (trial, maxPoints = 50, targetPoint) => {
    const data = [];
    let targetHit = null;
    for (let i = 0; i <= maxPoints; i++) {
        const x = trial.s_x_max * i / maxPoints;
        const y = trial.a * (x) ** 2 + trial.b * (x) + trial.c;
        if (targetPoint !== undefined) {
            if (checkTarget(x, y, targetPoint)) {
                targetHit = { x, y };
            }
        }
        data.push({ x: mathHelper.round(x, 3), y: mathHelper.round(y, 3) })
    }
    return { data, targetHit }
}

const checkTarget = (x, y, targetPoint) => {
    const dX = x - targetPoint.x;
    const dY = y - targetPoint.y;

    if (targetPoint.rad > Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2))) {
        return true
    }
    else {
        return false
    }
}


export default {
    calcParams,
    calcPath
}

