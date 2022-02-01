import firebase from 'firebase/app'
import 'firebase/analytics'
import fStore from './firestore'
import fAuth from './auth'
import fFunctions from './functions'

import store from '../../store/index.js'
import {firebaseConfig} from '../../secrets'




const app = firebase.initializeApp(firebaseConfig);
firebase.analytics();


fStore.init();
fAuth.init();
fFunctions.init();

// Connect to emulators if needed
if (location.hostname === "localhost") {
    // Initialize Firebase
    console.log("emulating");
    // Point cloud functions to the emulator
    // fFunctions.functions.useFunctionsEmulator('http://localhost:5001');
}


fAuth.auth.onAuthStateChanged(async (user) => {
    if (user) {
        // console.log(user.uid);
        const userDoc = await fStore.usersCollection.doc(user.uid).get()
        if (userDoc.exists) {
            const userData = userDoc.data()
            // Update store with user
            store.dispatch('setUser', { uid: user.uid, ...userData })
            // Attach listener to db
            // fStore.setLiftListener(userData.teamNum)

        } else {
            console.log('user document entry not found');
            store.dispatch('setUser', null)
        }

    }
    else {
        store.dispatch('setUser', null)
    }
})



export default {
    app,
    fAuth,
    fStore,
    fFunctions
}