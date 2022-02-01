import firebase from 'firebase/app'
import 'firebase/auth'


export default {
    auth: undefined,
    init() {
        this.auth = firebase.auth();
    },
    async signOut() {
        await this.auth.signOut();
    },
    getUser() {
        return this.auth.currentUser
    },
    async login({ email, pass }) {

        try {
            const cred = await this.auth.signInWithEmailAndPassword(email, pass);
            return cred.user
        } catch (error) {
            console.log(error);
            return error
        }

    },

}
