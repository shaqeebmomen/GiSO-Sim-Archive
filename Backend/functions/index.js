const motorSim = require('./math/motorSim.js');
const projCalc = require('./math/projectileCalc.js');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

admin.initializeApp();

const dbRef = admin.firestore();

const trialTimeout = 2 * 60 // 2 minutes represented in seconds
// const trialTimeout = 2

const targetPoint = {
    x: 12,
    y: 6,
    rad: 0.3,
}

// Used to validate a user making a request
const validateAuth = async (context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add trials'
        );
    }

    const user = (await admin.firestore().collection('users').doc(context.auth.uid).get()).data()
    if (user === undefined) {
        throw new functions.https.HttpsError(
            'not-found',
            `user ${context.auth.uid} not found`
        );
    }

    return user
}

// Used to check how long it has been since the last trial submission
const checkTrialTime = (user) => {
    const sinceLast = Firestore.Timestamp.now().seconds - user.lastTrial.seconds
    if (sinceLast < trialTimeout) {
        throw new functions.https.HttpsError(
            'permission-denied',
            `you must wait ${trialTimeout - sinceLast} more seconds before submitting another test`
        );
    }
}

// Use to remove all function properties from an object
const cleanResults = (resultObj) => {
    const output = {}
    // For every available property in the object to clean
    for (const key in resultObj) {
        // Check that the property doesn't belong to a parent and that it isnt a function
        if (resultObj.hasOwnProperty(key) && typeof (resultObj[key]) !== 'function') {
            // If a property passes the test, append it to the output
            output[key] = resultObj[key]
        }
    }

    // Return the cleaned object
    return output
}
const getLandingSpeedTier = (speed) => {
    if (speed > 10 && speed <= 15) {
        return 1;
    } else if (speed > 7 && speed <= 10) {
        return 1.5;
    } else if (speed > 3 && speed <= 7) {
        return 2;
    } else if (speed <= 3) {
        return 2.5;
    }
}

const scaleUpdate = (target, benchmark, keys, records) => {

    if (target[keys[0]] > records[keys[1]]) {
        records[keys[1]] = target[keys[0]];
    }
    if (target[keys[0]] > benchmark[keys[1]]) {
        return 15
    }
    else {
        return 15 * target[keys[0]] / benchmark[keys[1]]
    }

}

const calcTeamScore = (launchParams, teamUpdate, globalsData, stageCount, hitTarget, recordsData) => {
    // Calculate team-relative score
    let trialScore = 0;

    // Bonuses
    // Target
    if (hitTarget) {
        trialScore += 3.5;
    }
    // Landing
    trialScore += getLandingSpeedTier(Math.abs(launchParams.v_y_f));
    // Efficiency
    trialScore += (5 - stageCount);

    // Scaled maxes
    trialScore += scaleUpdate(launchParams, globalsData, ['s_x_max', 'maxDist'], recordsData);
    trialScore += scaleUpdate(launchParams, globalsData, ['s_y_max', 'maxHeight'], recordsData);

    // Update team best score
    if (trialScore > teamUpdate.topScore) {
        teamUpdate.topScore = trialScore;
        teamUpdate.bestTrialNum = teamUpdate.trialCount;
    }
    return trialScore;
}

exports.submitLaunch = functions.https.onCall(async (data, context) => {

    // get refs to user 
    const user = await validateAuth(context)
    if (user === null) {
        throw new functions.https.HttpsError(
            'internal',
            'internal server error in authentication'
        )
    }
    let startTimeout = false;

    const userRef = dbRef.collection('users').doc(context.auth.uid)
    // only trigger time check for non admin users
    const userDoc = await userRef.get();
    if (userDoc.data().isAdmin === undefined) {
        // check if the timer is up
        checkTrialTime(user)
        startTimeout = true;
    }

    // Grab paramters from user request and perform calculations
    const { ratio, angle, length, stageCount } = data
    let launchParams;
    const { exitOmega, exitHeight, launchTime } = { ...motorSim.calcExit(ratio, angle * Math.PI / 180, length) } // exitOmega will return as 0 if there is not enough initial torque

    // exitOmega > 0 => we have enough initial torque and we can calculate the flight path
    if (exitOmega > 0) {
        launchParams = projCalc.calcParams(exitOmega, exitHeight, Math.PI / 2 - (angle * Math.PI / 180), length)

        // Otherwise we don't have enough initial torque and we should let the user know
    } else {
        return { error: `Not Enough Torque to Lift ${motorSim.mass_load} kg` }
    }

    // Get reference to current team data and bests
    const teamRef = dbRef.collection('teams').doc(user.teamNum.toString());
    const teamUpdate = (await teamRef.get()).data();
    if (teamUpdate.launchTrialCount === undefined) {
        teamUpdate.launchTrialCount = 1
    } else {
        teamUpdate.launchTrialCount++;
    }
    const globalsDoc = await dbRef.collection('teams').doc('global').get();
    const globalsData = globalsDoc.data();
    const recordsDoc = await dbRef.collection('teams').doc('records').get();
    const recordsData = recordsDoc.data();

    // Calculating score
    const { targetHit } = projCalc.calcPath(launchParams, undefined, targetPoint)
    const score = calcTeamScore(launchParams, teamUpdate, globalsData, stageCount, targetHit, recordsData);

    // Updating team-wide stats
    await teamRef.update(teamUpdate)
    await dbRef.collection('teams').doc('records').update(recordsData);

    // Calculations complete, we can now try to send a response back and write to the db

    try {
        const trialTime = Firestore.Timestamp.now();
        // Save all relevant data to firestore

        const launchTrial = {
            createdAt: trialTime,
            params: data,
            teamNum: user.teamNum,
            userID: context.auth.uid,
            userName: user.name,
            results: { ...launchParams, exitHeight, exitOmega: exitOmega / Math.PI * 180, targetHit, launchTime },
            targetPoint,
            trialNum: teamUpdate.launchTrialCount,
            score,
            startTimeout
        }

        // Writing to db
        await dbRef.collection('launchTrials').doc().set(launchTrial);

        // Update the lastTrial time for the current user
        await userRef.update({ lastTrial: trialTime })

        // Send trial data back
        return launchTrial;
    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError(
            'aborted',
            'error saving data'
        );
    }
});


exports.submitLift = functions.https.onCall(async (data, context) => {
    const user = await validateAuth(context)
    if (user === null) {
        throw new functions.https.HttpsError(
            'internal',
            'internal server error in authentication'
        )
    }

    let startTimeout = false;

    const userRef = dbRef.collection('users').doc(context.auth.uid)
    // only trigger time check for non admin users
    const userDoc = await userRef.get();
    // if (userDoc.data().isAdmin === undefined) {
    //     // check if the timer is up
    //     checkTrialTime(user)
    //     startTimeout = true;
    // }

    // get parameters from user
    const { ratio, angle, length } = data

    // calculate results from the lift, depending on provided parameters
    // convert angle to rad before passsing in
    const liftResults = { ...motorSim.calcExit(ratio, angle * Math.PI / 180, length) }

    // exitOmega > 0 => we have enough initial torque and we can calculate the flight path
    if (liftResults.exitOmega <= 0) {
        return { error: `Not Enough Torque to Lift ${motorSim.mass_load} kg`, startTimeout }
    }

    try {
        const trialTime = Firestore.Timestamp.now();

        // save & update all relevant information to the db
        const team = await dbRef.collection('teams').doc(user.teamNum.toString()).get();
        const currentCount = team.data().trialCount + 1;
        const exitVelocity = (liftResults.exitOmega * length);
        const liftTrial = {
            createdAt: trialTime,
            params: data,
            teamNum: user.teamNum,
            userID: context.auth.uid,
            userName: user.name,
            results: { ...liftResults, exitOmega: liftResults.exitOmega / Math.PI * 180, exitAlpha: liftResults.exitAlpha / Math.PI * 180, data: cleanResults(liftResults.data), exitVelocity },
            trialNum: currentCount,
            score: exitVelocity,
            startTimeout
        }

        // Updating team-wide stats
        await dbRef.collection('teams').doc(user.teamNum.toString()).update({ trialCount: currentCount })
        // Writing trial results to db
        await dbRef.collection('liftTrials').doc().set(liftTrial);
        // Update the lastTrial time for the current user
        await userRef.update({ lastTrial: trialTime })
        return liftTrial
    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError(
            'aborted',
            'error saving data'
        );
    }

});



// Administrative only, meant to create the document for any users I add on the back end
exports.createUserDoc = functions.auth.user().onCreate(async (user) => {
    try {
        await dbRef.collection('users').doc(user.uid).set({
            name: user.displayName || 'name',
            teamNum: 0,
            lastTrial: Firestore.Timestamp.now()
        })
    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError(
            'internal',
            'error creating new user document'
        )
    }
});


// Administrative only, meant to delete the document for any users I remove on the back end
exports.deleteUserDoc = functions.auth.user().onDelete(async (user) => {
    try {
        await dbRef.collection('users').doc(user.uid).delete()
    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError(
            'internal',
            `error deleting user ${user.uid} document`
        )
    }
});

exports.getFinalResults = functions.https.onCall(async (data, context) => {
    // const teamsRef = dbRef.collection('teams');
    // const teamSnap = await teamsRef.get();

    // for (let i = 0; index < teamSnap.size(); index++) {
    //     const teamDoc = teamSnap.docs[i]

    // }

    const teamTrialMap = {
        "1": 16,
        "3": 25,
        "4": 52,
        "9": 76,
        "10": 31,
        "11": 46,
        "12": 30
    }

    for (let i = 1; i < 12; i++) {
        const trialSnap = await dbRef.collection('trials').where("teamNum", "==", i).get();
        for (let j = 0; index < trialSnap.size(); index++) {
            const trialSnap = teamSnap.docs[i]

        }
    }

    for (const key in teamTrialMap) {
        const trialSnap = await dbRef.collection('trials').where("teamNum", "==", i).get();
        trialSnap.docs.find((trial) => {
            trial.trialNum = teamTrialMap[key]
        })
    }
})