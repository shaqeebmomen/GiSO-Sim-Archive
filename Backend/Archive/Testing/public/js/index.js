// dataForm = document.getElementById("trial-form")
// url = "https://us-central1-giso-2020-simulator.cloudfunctions.net/addTrial"

// dataForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const addTrial = functions.httpsCallable("addTrial");

//     addTrial({
//         creator: FirebaseFirestore.auth.currentUser.id,
//         gearRatio: dataForm["ratio-input"].value,
//         releaseAngle: dataForm["angle-input"].value,
//     })
// })