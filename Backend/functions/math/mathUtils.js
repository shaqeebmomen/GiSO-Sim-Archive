

module.exports = {
    round: (value, decimals) => {
        return Number(value.toFixed(decimals));
    },
    trim: (array, maxpoints) => {
        const trimmedTime = []
        trimmedTime.push(array[0])
        if (array.length < 2) {
            throw new Error("array is too short")
        }
        const removal = Math.floor(((array.length) / (maxpoints)))
        // console.log("removal: " + removal);
        for (let i = 0; i < array.length - removal; i += removal) {
            let sum = 0
            for (let j = 0; j < removal; j++) {

                sum += array[i + j]
            }
            trimmedTime.push(sum / removal)
        }
        trimmedTime.push(array[array.length - 1])
        return trimmedTime
    }
}
