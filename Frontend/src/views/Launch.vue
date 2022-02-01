<template>
  <div class="launch-container">
    <div class="logo-container">
      <img id="logo" src="../assets/images/logo.png" />
    </div>

    <Banner :pagetitle="title" class="banner" />
    <div
      class="sidebar card m-2 is-flex-direction-column is-justify-content-space-between"
      style="display: flex"
    >
      <ParamsForm
        class="params"
        :stages="4"
        :gears="gears.practiceGears"
        :inputsOverride="inputsOverride"
        :submitFunction="submitLaunch"
        @trialReturn="trialReturn"
        @removeOverride="removeOverride"
        @lengthUpdate="lengthUpdate"
      />

      <Leaderboard
        :disabled="
          topTrials === undefined || topTrials === null || topTrials.length < 1
        "
        class="leaderboard"
        :topTrials="topTrials"
        @updateActiveTrial="updateActiveTrial"
      />
    </div>
    <div class="animation-window card m-2">
      <div class="card-content p-2">
        <LaunchBox
          class="launch-box"
          :endAngle="endAngle"
          :launchTime="launchTime"
          :airTime="airTime"
          :reset="reset"
          :idle="activeTrial === undefined"
          :armLength="armLength"
          :detailMessages="detailMessages"
          :trial="activeTrial"
        />
      </div>
    </div>
    <div ref="footer" class="footer m-2 p-0">
      <HistoryBar
        @updateActiveTrial="updateActiveTrial"
        :trials="teamTrials"
        :activeTrialNum="activeTrial ? activeTrial.trialNum : null"
        :submission="submitted"
        class="history"
      />
    </div>
  </div>
</template>

<script>
import ParamsForm from "@/components/ParamsForm.vue";
import Banner from "@/components/Banner.vue";
import Leaderboard from "@/components/Leaderboard.vue";
import HistoryBar from "@/components/HistoryBar.vue";
import LineChart from "@/components/LineChart.vue";
import LaunchBox from "@/components/LaunchBox.vue";
import gears from "@/utils/gears.js";
import { mapState } from "vuex";
import firebase from "@/utils/firebase/firebase.js";
import mathHelp from "@/utils/math/mathHelper.js";
import options from "@/utils/graphical/chartUtils.js";
import colors from "@/assets/branding.js";

export default {
  components: {
    ParamsForm,
    Banner,
    Leaderboard,
    HistoryBar,
    LineChart,
    LaunchBox,
  },
  data() {
    return {
      gears,
      title: "Kirby's Lift Off",
      topCount: 3,
      activeTrial: undefined,
      labelMap: {
        v_exit: {
          label: "Exit Velocity",
          order: 2,
          units: "m/s",
        },
        s_x_max: {
          label: "Max Distance",
          order: 3,
          units: "m",
        },
        s_y_max: {
          label: "Max Height",
          order: 1,
          units: "m",
        },
        time: {
          label: "Time of Flight",
          order: 0,
          units: "s",
        },
        v_y_f: {
          label: "Vertical Landing Velocity",
          order: 4,
          units: "m/s",
        },
      },
      reset: false,
      submitted: false,
      footerParent: false,
      inputsOverride: null,
      armLength: 0,
      detailMessages: [],
      submitLaunch: firebase.fFunctions.submitLaunch,
    };
  },
  computed: {
    ...mapState(["user", "teamTrials"]),
    topTrials() {
      // return undefined;
      const trials = this.teamTrials;
      return this.getTopResults(trials, this.topCount);
    },
    endAngle() {
      if (this.activeTrial !== undefined) {
        return (this.activeTrial.params.angle / 180) * Math.PI;
      } else {
        return 0;
      }
    },
    launchTime() {
      if (this.activeTrial !== undefined) {
        return this.activeTrial.results.launchTime;
      } else {
        return 0;
      }
    },
    airTime() {
      if (this.activeTrial !== undefined) {
        return this.activeTrial.results.time;
      } else {
        return 0;
      }
    },
    animLength() {
      if (this.activeTrial !== undefined) {
        return this.activeTrial.params.length;
      } else {
        return 0;
      }
    },
  },
  watch: {
    user(newVal) {
      if (newVal !== null) {
        firebase.fStore.setLaunchListener(newVal.teamNum);
        this.activeTrial = this.teamTrials.find((trial) => {
          console.log(trial);
          return trial.userName === this.user.name;
        });
      }
    },
    activeTrial(newVal) {
      if (newVal !== undefined) {
        if (newVal["error"] !== undefined) {
          this.clearActiveTrial();
          this.fireMessage([
            newVal.error,
            ":\nIncrease ratio or reduce arm length?",
          ]);
        } else {
          this.resetAnimation();

          // Update detail messages
          this.detailMessages = [];
          for (const key in newVal.results) {
            if (this.labelMap[key] !== undefined) {
              this.detailMessages.push([
                this.labelMap[key].label,
                newVal.results[key].toFixed(3) + " " + this.labelMap[key].units,
              ]);
            }
          }
          this.detailMessages.sort((next, prev) => {
            return next[0].localeCompare(prev[0]);
          });
          // Update the params form
          this.inputsOverride = newVal.params;
        }
      }
    },
  },
  mounted() {
    this.footerParent = this.$refs.footer;
    // firebase.fStore.setLaunchListener(this.user.teamNum);
  },
  methods: {
    getTopResults(array, count) {
      if (array !== undefined) {
        let output = [...array];
        output.sort((trialA, trialB) => {
          return trialB["score"] - trialA["score"];
        });
        if (output.length > count) {
          return output.slice(0, count);
        } else {
          return output;
        }
      } else {
        return [];
      }
    },
    updateActiveTrial(trial) {
      this.activeTrial = trial;
    },
    isKinematic(key) {
      return key === "theta" || key == "omega" || key === "alpha";
    },
    isDynamic(key) {
      return key === "torque" || key == "motorTorque" || key === "loadTorque";
    },
    trialReturn(trial) {
      this.updateActiveTrial(trial);
      this.submitted = true;
      this.$nextTick(() => {
        this.submitted = false;
      });
    },
    clearActiveTrial() {
      this.activeTrial = undefined;
      this.activeKinData = {
        datasets: [],
        labels: [],
      };
      this.activeDynData = {
        datasets: [],
        labels: [],
      };
      this.activeXVals = [];
      this.resetAnimation();
    },
    removeOverride() {
      this.inputsOverride = null;
      this.clearActiveTrial();
    },
    fireMessage(message) {
      this.$buefy.toast.open({
        type: "is-black",
        message: [...message],
        position: "is-top",
        duration: 4000,
      });
    },
    lengthUpdate(length) {
      this.armLength = length;
    },
    resetAnimation() {
      this.reset = true;
      this.$nextTick(() => {
        this.reset = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/sass/components/launch.scss";
</style>