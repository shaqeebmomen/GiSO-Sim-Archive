<!--
    This is the login form component
    Holds the data of current entered credentials
    Fires an event to have parent level control authentication implementation
-->

<template>
  <div class="card">
    <div class="card-content">
      <p class="is-size-3 has-text-white">GiSO 2020 Simulator Suite</p>
    </div>
    <div class="card-content pt-0">
      <!-- Email -->
      <div class="field">
        <label class="label has-text-white">Email</label>
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="email"
            placeholder="Email"
            v-model="email"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
        <p id="email-error" class="has-text-danger pt-1">
          {{ emailError }}
        </p>
      </div>
      <!-- Password -->
      <div class="field">
        <label class="label has-text-white">Password</label>
        <div class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="password"
            placeholder="Password"
            v-model="pass"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
        <p id="pass-error" class="has-text-danger pt-1">{{ passError }}</p>
      </div>
    </div>

    <div class="card-content pt-0 pb-3">
      <div class="buttons mb-2">
        <div class="buttons1">
          <button
            :disabled="!formValid || loading"
            class="button is-primary"
            @click="submitForm(destinations.lift)"
          >
            Start Lift Sim
          </button>
          <button
            :disabled="!formValid || loading"
            class="button is-primary"
            @click="submitForm(destinations.launch)"
          >
            Start Launch Sim
          </button>
        </div>
        <button class="button is-danger" @click="inputGuest()">
          Input Guest Login
        </button>
      </div>
    </div>
    <progress
      v-if="loading"
      class="progress is-small is-primary"
      max="100"
    ></progress>
  </div>
</template>

<script>
import validator from "validator";

export default {
  props: ["loginErrors", "loading"],
  data() {
    return {
      email: "",
      pass: "",
      emailError: "",
      passError: "",
      destinations: {
        launch: "Launch",
        lift: "Lift",
      },
    };
  },
  computed: {
    formValid() {
      return (
        validator.isEmail(this.email) &&
        validator.isLength(this.pass, { min: 10, max: 100 })
      );
      return true;
    },
  },
  watch: {
    loginErrors(newVal) {
      this.emailError = newVal.emailError;
      this.passError = newVal.passError;
    },
  },
  methods: {
    submitForm(dest) {
      this.$emit("submitForm", {
        email: this.email,
        pass: this.pass,
        dest,
      });
    },
    inputGuest() {
      this.email = "guest@giso.com";
      this.pass = "guestGiSO0";
    },
  },
  created() {
    Object.freeze(this.destinations);
  },
  mounted() {
    if (location.hostname === "localhost") {
      // setTimeout(() => {
      //   this.$emit("submitForm", {
      //     email: "admin@giso.com",
      //     pass: "admin12345",
      //     dest: this.destinations.launch,
      //   });
      // }, 1000);
    }
  },
};
</script>

<style lang="scss" scoped>
.buttons1 {
  display: flex;
  justify-content: flex-start;
}
.buttons {
  display: flex;
  justify-content: space-between;
}
</style>

