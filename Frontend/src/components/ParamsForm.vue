<template>
  <div
    :class="[
      'ParamsForm-container',
      $mq === 'lg' ? 'p-3' : 'p-2',
      'is-flex-direction-column',
      'is-justify-content-space-between',
    ]"
    style="display: flex"
  >
    <div ref="modal" class="modal" @click="toggleModal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title has-text-white is-size-5">Oops!</p>
          </header>
          <div class="card-content">
            <div class="content">
              <p v-for="(error, index) in formErrors" :key="index">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      :class="['stage', $mq === 'sm' ? 'mb-1' : '']"
      v-for="stage in stages"
      :key="stage"
    >
      <div class="stage-label-row mt-1">
        <p :class="$mq">{{ "Stage: " + stage }}</p>

        <div :class="['icon', 'has-text-primary', 'is-primary', $mq]">
          <i :class="['fas', 'fa-cogs', $mq]"></i>
        </div>
      </div>
      <div class="field">
        <div class="stage-row" style="display: flex flex-wrap:wrap">
          <div
            :class="['control', 'pt-1', $mq]"
            v-for="position in 2"
            :key="position"
          >
            <div :class="['select', 'has-text-centered', $mq]">
              <select
                v-model="gearVals[2 * (stage - 1) + position - 1]"
                @input="removeOverride"
              >
                <option
                  v-for="gear in gears"
                  :selected="gear == getDefaultGear ? 'selected' : ''"
                  :key="gear"
                  :value="gear"
                >
                  {{ gear }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p
      :class="[
        'has-text-primary',
        'mt-1',
        'ratio',
        $mq,
        'has-text-weight-bold',
      ]"
    >
      {{ "Ratio:  " + ratio }}
    </p>

    <div class="field mb-1">
      <p :class="$mq">Length (m)</p>
      <b-tooltip position="is-right" label="0.5m - 2m" style="width: 100%">
        <div class="control has-icons-left">
          <input
            @input="removeOverride"
            type="number"
            :class="['input', $mq]"
            v-model="length"
            min="0.5"
            max="2"
            step="0.1"
          />
          <div class="icon has-text-primary is-small is-left">
            <i class="fas fa-ruler-horizontal"></i>
          </div></div
      ></b-tooltip>
    </div>

    <div class="field">
      <p :class="$mq">Angle (deg)</p>
      <b-tooltip position="is-right" label="10deg - 90deg" style="width: 100%">
        <div class="control has-icons-left">
          <input
            @input="removeOverride"
            type="number"
            :class="['input', $mq]"
            v-model="exitAngle"
            min="10"
            max="90"
            step="1"
          />
          <div id="less-than" class="icon has-text-primary is-small is-left">
            <i class="fas fa-less-than"></i>
          </div></div
      ></b-tooltip>
    </div>

    <button
      :disabled="!submitOkay || submitTimeout"
      :class="['is-primary', 'button', loading ? 'is-loading' : '']"
      @click="submitTrial"
    >
      {{ submitTimeout ? "2 min" : "Submit" }}
    </button>
  </div>
</template>

<script>
import firebase from "../utils/firebase/firebase";
export default {
  props: ["stages", "gears", "inputsOverride", "submitFunction"],
  data() {
    return {
      length: 0.5,
      gearVals: [],
      exitAngle: 10,
      loading: false,
      usedStages: 1,
      precision: 50,
      submitOkay: true,
      submitTimeout: false,
    };
  },
  watch: {
    inputsOverride(newVal) {
      if (newVal !== null) {
        this.length = newVal.length;
        this.exitAngle = newVal.angle;
        this.gearVals = newVal.gears;
        this.submitOkay = false;
      }
    },
    length(newVal) {
      this.$emit("lengthUpdate", newVal);
    },
  },
  computed: {
    ratio() {
      let output = 1;
      this.usedStages = 0;
      for (let i = 0; i < this.stages; i++) {
        const currentRatio =
          parseInt(this.gearVals[2 * i + 1]) / parseInt(this.gearVals[2 * i]);
        if (currentRatio !== 1) {
          this.usedStages++;
        }
        output *= currentRatio;
      }
      if (this.usedStages === 0) {
        this.usedStages = 1;
      }
      return output.toPrecision(3);
    },
    formErrors() {
      let outputStr = [];
      const ratioCheck = this.ratio >= 1 && this.ratio <= 350;
      const angleCheck = this.exitAngle >= 10 && this.exitAngle <= 90;
      const lengthCheck = this.length >= 0.5 && this.length <= 2.0;
      if (!ratioCheck) {
        outputStr.push("Ratio should be between 1 - 350\n");
      }
      if (!angleCheck) {
        outputStr.push("Angle should be between 10deg - 90deg\n");
      }
      if (!lengthCheck) {
        outputStr.push("Length should be between 0.5m - 2m\n");
      }
      return outputStr;
    },
  },
  methods: {
    getDefaultGear() {
      return Math.min(...this.gears);
    },
    async submitTrial() {
      if (this.formErrors.length === 0) {
        const trial = {
          ratio: parseFloat(this.ratio),
          angle: this.exitAngle,
          length: parseFloat(this.length),
          gears: this.gearVals,
          stageCount: this.usedStages,
          precision: this.precision,
        };
        console.log("sending", trial);
        this.loading = true;
        this.submitTimeout = true;
        let results = null;
        try {
          // results = await firebase.fFunctions.submitLift(trial);
          results = await this.submitFunction(trial);
          this.loading = false;
          if (results.data.startTimeout) {
            // If response says to timeout, leave state as is and schedule the change later
            setTimeout(() => {
              this.submitTimeout = false;
            }, 1000 * 60 * 2);
          } else {
            // Response says we don't timeout so, reset state right away
            this.submitTimeout = false;
          }
        } catch (error) {
          this.loading = false;
          this.submitTimeout = false;
        }
        console.log("got", results);
        this.$emit("trialReturn", results.data);
      } else {
        this.toggleModal();
      }
    },
    toggleModal() {
      this.$refs["modal"].classList.toggle("is-active");
    },
    removeOverride() {
      this.submitOkay = true;
      this.$emit("removeOverride");
    },
  },
  mounted() {
    for (let i = 0; i < this.stages * 2; i++) {
      this.gearVals.push(this.getDefaultGear());
    }
    this.$emit("lengthUpdate", this.length);
  },
};
</script>

<style lang="scss" scoped >
@import "@/assets/sass/branding.scss";
@import "@/assets/sass/main.scss";

.modal {
  transition: all 0.2s ease-in-out;
  opacity: 0;
  display: flex;
  transform-origin: center;
  transform: scale(0);
  .modal-background {
    transition: inherit;

    opacity: 0;
  }
  .modal-content {
    @extend .p-3;
    display: grid;
    place-items: center;
    transform: scale(0.8);
    transition: inherit;
    .card {
      box-shadow: 0px 0px 10px 4px rgba($color: #000000, $alpha: 0.3);
      width: fit-content;
      background-color: $bright-red;
    }
  }
  &.is-active {
    opacity: 1;
    transform: scale(1);

    .modal-content {
      transform: scale(1);
    }
    .modal-background {
      opacity: 1;
    }
  }
}

.button {
  width: 100%;
}
.stage-label-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.stage-row {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;
}
input {
  width: inherit;
  &.sm {
    @extend .is-small;
  }
}
.select {
  &.sm {
    @extend .is-small;
    @extend .is-fullwidth;
  }
  &.md {
    @extend .is-small;
  }
}
p,
.label {
  color: $white;
  &.sm {
    @extend .is-size-7;
  }
  &.md {
    @extend .is-size-6;
  }
  &.lg {
    @extend .is-size-5;
  }
}
.icon {
  &.sm {
  }
  &.md {
    @extend .is-medium;

    font-size: 1.33em;
  }
  &.lg {
    @extend .is-medium;

    font-size: 1.5em;
  }
}

#less-than {
  transform: translateY(1px) rotate(-24deg);
}
</style>