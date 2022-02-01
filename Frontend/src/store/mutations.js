export default {
    // Save the userId
    setUser: (state, payload) => {
        if (payload) {
            console.log('logged in');
            state.user = payload;
        }
        else {
            console.log('logged out');
            state.user = null;
        }
    },
    // Save trials list
    setTrials: (state, payload) => {
        if (payload) {
            console.log('updated trials');
            state.teamTrials = payload;
        }
        else {
            console.error('failed to update trials, payload: ', payload);
        }
    },
    // Set the app wide loading state
    setLoadingState: (state, payload) => {
        state.globalLoading = payload;
    }

}