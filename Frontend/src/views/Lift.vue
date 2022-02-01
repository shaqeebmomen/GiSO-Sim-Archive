<template>
  <div class="lift-container p-2">
    <div class="logo-container">
      <img id="logo" src="../assets/images/logo.png" />
    </div>

    <Banner
      :imgSrc="'../assets/images/donkeykong.gif'"
      :pagetitle="title"
      class="banner"
    />
    <div
      class="sidebar card m-2 is-flex-direction-column is-justify-content-space-between"
      style="display: flex"
    >
      <ParamsForm
        class="params"
        :stages="3"
        :gears="gears.practiceGears"
        :inputsOverride="inputsOverride"
        :submitFunction="submitLift"
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

    <div class="displays">
      <div class="animation-window card m-2">
        <div class="card-content p-2">
          <LiftBox
            class="lift-box"
            :endAngle="animAngle"
            :animTime="animTime"
            :reset="reset"
            :idle="activeTrial === undefined"
            :armLength="armLength"
            :detailMessages="detailMessages"
          />
        </div>
      </div>
      <div class="kinematics-graph card m-2">
        <div class="field graph-switch m-2">
          <input
            class="is-checkradio"
            id="motion"
            type="radio"
            name="motion"
            value="kin"
            v-model="activeChoice"
          />
          <label for="motion">Motion</label>
          <input
            class="is-checkradio"
            type="radio"
            id="torques"
            name="torques"
            value="dyn"
            v-model="activeChoice"
          />
          <label for="torques">Torques</label>
        </div>
        <div class="field scale-switch m-2">
          <input
            class="is-checkradio"
            id="scale"
            type="checkbox"
            name="scale"
            v-model="fixedScale"
          />
          <label for="scale">Start At 0</label>
        </div>

        <LineChart
          :chartData="activeKinData"
          :xLabel="'Time (ms)'"
          :yLabel="'Deg (/s, /s^2)'"
          :adaptiveScale="fixedScale"
          :options="options"
          class="line-chart card-content"
          v-if="activeChoice === 'kin'"
        />
        <LineChart
          :chartData="activeDynData"
          :xLabel="'Time (ms)'"
          :yLabel="'Nm'"
          :adaptiveScale="fixedScale"
          :options="options"
          class="line-chart card-content"
          v-else
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
import LiftBox from "@/components/LiftBox.vue";
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
    LiftBox,
  },
  data() {
    return {
      gears,
      title: "DK's Barrel Arm",
      topCount: 3,
      activeTrial: undefined,
      activeXVals: [],
      styleMap: {
        theta: {
          label: "Angle",
          color: colors.starYellow,
          order: 0,
        },
        omega: {
          label: "Angular Velocity",
          color: colors.brightestCyan,
          order: 1,
        },
        alpha: {
          label: "Angular Acceleration",
          color: colors.fuchsia,
          order: 2,
        },
        torque: {
          label: "Net Torque",
          color: colors.brightestPink,
          order: 3,
        },
        motorTorque: {
          label: "Motor Torque",
          color: colors.seafoamGreen,
          order: 4,
        },
        loadTorque: {
          label: "Load Torque",
          color: colors.limeGreen,
          order: 5,
        },
      },
      labelMap: {
        exitVelocity: {
          label: "Exit Velocity",
          order: 3,
          units: "m/s",
        },
        exitAlpha: {
          label: "Exit Angular Acceleration",
          order: 4,
          units: "deg/s^2",
        },
        exitHeight: {
          label: "Exit Height",
          order: 1,
          units: "m",
        },
        launchTime: {
          label: "Time to Lift",
          order: 0,
          units: "s",
        },
        exitOmega: {
          label: "Exit Angular Velocity",
          order: 5,
          units: "deg/s",
        },
      },
      activeKinData: {},
      activeDynData: {},
      activeChoice: "kin",
      options,
      fixedScale: false,
      reset: false,
      submitted: false,
      footerParent: false,
      inputsOverride: null,
      armLength: 0,
      detailMessages: [],
      submitLift: firebase.fFunctions.submitLift,
    };
  },
  computed: {
    ...mapState(["user", "teamTrials"]),
    topTrials() {
      // return undefined;
      const trials = this.teamTrials;
      return this.getTopResults(trials, this.topCount);
    },
    animAngle() {
      if (this.activeTrial !== undefined) {
        return (this.activeTrial.params.angle / 180) * Math.PI;
      } else {
        return 0;
      }
    },
    animTime() {
      if (this.activeTrial !== undefined) {
        return this.activeTrial.results.launchTime;
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
        // firebase.fStore.getTeamLiftTrials(this.user.teamNum);
        firebase.fStore.setLiftListener(this.user.teamNum);
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
          // Update the graph with relevant data
          const output = [];
          for (const key in newVal.results.data) {
            if (key !== "time") {
              output.push({
                data: newVal.results.data[key].map((data) => {
                  return mathHelp.round(data, 2);
                }),
                key,
                order: this.styleMap[key].order,
                label: this.styleMap[key].label,
                borderColor: this.styleMap[key].color,
                pointBackgroundColor: this.styleMap[key].color,
                // yAxisID: this.isKinematic(key) ? "kinematics" : "dynamics",
                pointStyle: this.isKinematic(key) ? "circle" : "rectRot",
              });
            }
          }
          // Sort sets for the graph
          output.sort((set, nextSet) => {
            if (set.order > nextSet.order) {
              return 1;
            } else {
              return -1;
            }
          });
          // Write to variables passed to the graph
          this.activeXVals = newVal.results.data["time"].map((time) => {
            return mathHelp.round(time * 1000, 2);
          });
          this.activeKinData = {
            datasets: output.filter((set) => {
              return this.isKinematic(set.key);
            }),
            labels: this.activeXVals,
          };
          this.activeDynData = {
            datasets: output.filter((set) => {
              return this.isDynamic(set.key);
            }),
            labels: this.activeXVals,
          };
          // Update detail messages
          this.detailMessages = [];
          for (const key in newVal.results) {
            if (key !== "data") {
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
    firebase.fStore.setLiftListener(this.user.teamNum);
  },
  methods: {
    getTopResults(array, count) {
      if (array !== undefined) {
        let output = [...array];
        output.sort((trialA, trialB) => {
          return trialB.results["exitOmega"] - trialA.results["exitOmega"];
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
@import "../assets/sass/components/lift.scss";
</style>