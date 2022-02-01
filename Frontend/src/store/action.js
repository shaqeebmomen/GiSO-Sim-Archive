// For testing
// function timeout(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// const error = false;

export default {
    // login: async (context, payload) => {

    //     const result = await (
    //         await fetch("/api/auth", {
    //             method: "POST",
    //             headers: {
    //                 "Content-type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 email: payload.email,
    //                 password: payload.pass,
    //             }),
    //         })
    //     ).json();
    //     if (result.errors) {
    //         return result;
    //     } else if (result.user) {
    //         context.commit('setUser', { user: result.user, guest: result.guest });
    //         return result;
    //     } else {
    //         context.commit('setUser', null);
    //         return null;
    //     }
    // },
    setUser: (context, payload) => {
        context.commit('setUser', payload);
    },
    setTrials: (context, payload) => {
        payload.sort((first, second) => {
            return first.trialNum - second.trialNum
        })
        context.commit('setTrials', payload);
    },
    setLoadingState: (context, payload) => {
        context.commit('setLoadingState', payload)
    }

}