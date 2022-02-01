import firebase from 'firebase/app'
import 'firebase/firestore'
import store from '../../store/index.js'


export default {
    db: undefined,
    usersCollection: undefined,
    liftsCollection: undefined,
    launchesCollection: undefined,
    init() {
        this.db = firebase.firestore();
        // if (location.hostname === 'localhost') {
        //     this.db.useEmulator("http://localhost:8080")
        // }
        this.usersCollection = this.db.collection('users')
        this.liftsCollection = this.db.collection('liftTrials')
        this.launchesCollection = this.db.collection('launchTrials')
    },
    async getTeamLiftTrials() {
        // Let the whole app know updates are being loaded
        store.dispatch('setLoadingState', true);
        const teamTrialsSnap = await this.liftsCollection.where("teamNum", "==", store.state.user.teamNum).get()
        // console.log("Snapshot", teamTrialsSnap);
        const trials = []
        teamTrialsSnap.forEach(function (doc) {
            // console.log("Data", doc.data());
            trials.push(doc.data())
        })
        // Setting array in store to
        store.dispatch('setTrials', trials);
        // Update app-wide loading
        store.dispatch('setLoadingState', false);
    },
    setLiftListener(teamNum) {
        // Update store with team trials and set listener
        // TODO MOVE THIS INTO FIRESTORE MODULE
        this.liftsCollection.where("teamNum", "==", teamNum)
            .onSnapshot(function (teamTrialsSnap) {
                // Let the whole app know updates are being loaded
                store.dispatch('setLoadingState', true);
                // console.log("Snapshot", teamTrialsSnap);
                const trials = []
                teamTrialsSnap.forEach(function (doc) {
                    // console.log("Data", doc.data());
                    trials.push(doc.data())
                })
                // Setting array in store to
                store.dispatch('setTrials', trials);
                // Update app-wide loading
                store.dispatch('setLoadingState', false);
            })

    },
    setLaunchListener(teamNum) {
        // Update store with team trials and set listener
        // TODO MOVE THIS INTO FIRESTORE MODULE
        this.launchesCollection.where("teamNum", "==", teamNum)
            .onSnapshot(function (teamTrialsSnap) {
                // Let the whole app know updates are being loaded
                store.dispatch('setLoadingState', true);
                // console.log("Snapshot", teamTrialsSnap);
                const trials = []
                teamTrialsSnap.forEach(function (doc) {
                    // console.log("Data", doc.data());
                    trials.push(doc.data())
                })
                // Setting array in store to
                store.dispatch('setTrials', trials);
                // Update app-wide loading
                store.dispatch('setLoadingState', false);
            })

    },
    async getTeamLaunchTrials() {
        // Let the whole app know updates are being loaded
        store.dispatch('setLoadingState', true);
        const teamTrialsSnap = await this.launchesCollection.where("teamNum", "==", store.state.user.teamNum).get()
        // console.log("Snapshot", teamTrialsSnap);
        const trials = []
        teamTrialsSnap.forEach(function (doc) {
            // console.log("Data", doc.data());
            trials.push(doc.data())
        })
        // Setting array in store to
        store.dispatch('setTrials', trials);
        // Update app-wide loading
        store.dispatch('setLoadingState', false);
    },

}