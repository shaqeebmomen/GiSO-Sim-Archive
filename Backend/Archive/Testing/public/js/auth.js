const loginForm = document.querySelector('.login');
const oof = "oof"

const auth = firebase.auth();

// auth.signOut();
auth.onAuthStateChanged((user) => {
    console.log(user);
})

// login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            loginForm.querySelector('.error').innerHTML = '';
            if (document.getElementById("page-select").value === 'launch') {
                window.location = "launch.html";
            }
            else if (document.getElementById("page-select").value === 'lift') {
                window.location = "lift.html";
            }
        })
        .catch(error => {
            console.log(error);
            loginForm.querySelector('.error').textContent = error.message;
        });
});




