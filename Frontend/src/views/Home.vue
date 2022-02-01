<template>
  <div class="home-container">
    <img id="kirby" src="../assets/images/kirby.png" alt="" />
    <img id="logo" src="../assets/images/workmark.png" />
    <img
      id="coin"
      @click="launchKirby"
      :class="hinting ? 'hint' : 'no-hint'"
      src="../assets/images/coin-pink.png"
      alt=""
    />
    <LoginForm
      :loading="loading"
      @submitForm="login"
      :loginErrors="authErrors"
      class="login-form"
    />
    <p class="credits is-size-6">Developed by Shaqeeb Momen</p>
  </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
import anim from "@/utils/graphical/animation.js";
import projCalc from "@/utils/math/projectileCalc.js";
import fb from "@/utils/firebase/firebase.js";
import router from "@/router/index.js";
export default {
  name: "Home",
  components: {
    LoginForm,
  },
  data() {
    return {
      loading: false,
      authErrors: {
        emailError: "",
        passError: "",
      },
      animating: false,
      kirby: null,
      logo: null,
      hinting: false,
    };
  },
  computed: {},
  methods: {
    launchKirby() {
      const time = 4;
      if (!this.animating) {
        this.animating = true;
        this.hinting = false;
        setTimeout(() => {
          this.animating = false;
          this.hinting = true;
        }, time * 1000);
        anim.kirbyImgFlight(
          this.kirby,
          time,
          projCalc.calcPath,
          projCalc.calcParams(15, 10, Math.PI / 2 - Math.PI / 10, 3)
        );
      }
    },
    async login(data) {
      this.loading = true;
      const user = await fb.fAuth.login(data);
      // Error Logging in
      if (user.code !== undefined) {
        if (user.code === "auth/user-not-found") {
          this.authErrors = {
            emailError: "email not found",
          };
        } else if (user.code === "auth/wrong-password") {
          this.authErrors = {
            passError: "password incorrect",
          };
        } else {
          this.authErrors = {
            passError: "Please Contact The Games Committee: " + user.code,
          };
        }
      }
      // Login Success
      else {
        router.push({ name: data.dest });
      }
      this.loading = false;
    },
  },
  mounted() {
    this.kirby = document.getElementById("kirby");
    this.logo = document.getElementById("logo");
    fb.fAuth.signOut();
    setTimeout(() => {
      this.launchKirby();
    }, 4000);
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/sass/components/home.scss";
</style>