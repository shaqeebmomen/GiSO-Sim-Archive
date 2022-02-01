import firebase from 'firebase/app'
import 'firebase/functions'

export default {
    functions: undefined,
    init() {
        this.functions = firebase.functions();
        this.submitLift = this.functions.httpsCallable("submitLift");
        this.submitLaunch = this.functions.httpsCallable("submitLaunch");
        this.getBest = this.functions.httpsCallable("getFinalResults")
    },
}