<template>
  <div
    :class="[
      'Leaderboard-container',
      $mq,
      'is-flex-direction-column',
      'is-justify-content-space-around',
    ]"
    style="display: flex"
  >
    <div class="dropdown is-up" style="height: 100%">
      <div class="dropdown-trigger" style="height: 100%" @click="toggleMenu">
        <button
          style="display:flex height: 100%"
          :disabled="globalLoading || disabled"
          :class="[
            'button',
            globalLoading ? 'is-loading' : '',
            'is-info',
            'is-fullwidth',
            'is-flex-direction-row',
            'is-justify-content-space-around',
            'is-align-items-center',
          ]"
        >
          <mq-layout mq="lg">
            <div :class="['icon', 'has-text-primary', $mq]">
              <i class="fas fa-crown"></i>
            </div>
          </mq-layout>
          <p :class="['has-text-white', $mq]">Top {{ topTrials.length }}</p>
          <mq-layout mq="lg">
            <div :class="['icon', 'has-text-primary', $mq]">
              <i class="fas fa-crown"></i>
            </div>
          </mq-layout>
        </button>
      </div>
      <div class="dropdown-menu" role="menu">
        <div class="dropdown-content py-0">
          <div
            class="dropdown-item-wrapper"
            v-for="(trial, index) in topTrials"
            :key="index"
          >
            <a
              class="dropdown-item is-justify-content-flex-start is-align-items-center pr-2"
              style="display: flex"
              @click="updateActiveTrial(trial)"
            >
              <div class="details mr-3 has-text-black" style="width: 6em">
                <!-- TODO PASS PROPER TRIAL # BASED ON SUBMISSON TIME -->
                <p class="trial">Trial # {{ trial.trialNum }}</p>
                <p class="name">{{ trial.userName }}</p>
              </div>
              <span
                v-for="count in topTrials.length - index"
                :key="count"
                class="icon is-right is-large has-text-primary"
              >
                <i class="fas fa-crown"></i>
              </span>
            </a>
            <hr
              v-if="index !== topTrials.length - 1"
              class="dropdown-divider m-0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["topTrials", "disabled"],
  data() {
    return {};
  },
  computed: {
    ...mapState(["globalLoading"]),
  },
  methods: {
    toggleMenu(event = undefined) {
      if (event !== undefined) {
        event.stopPropagation();
      }
      document.querySelector(".dropdown").classList.toggle("is-active");
    },
    updateActiveTrial(trial) {
      this.$emit("updateActiveTrial", trial);
      this.toggleMenu();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/sass/main.scss";
@import "../assets/sass/branding.scss";

* {
  box-sizing: border-box;
}
.Leaderboard-container {
  &.sm,
  &.md {
    @extend .px-2, .pb-2;
  }

  &.lg {
    @extend .px-3, .pb-3;
  }
}

.place,
.details {
  display: grid;
  place-items: center;
}

.button {
  height: 100%;
}

.dropdown {
  width: 100%;
  .dropdown-menu {
    display: block;
    opacity: 0;
    transform: scaleY(0);
    transform-origin: bottom;
    transition: all 0.3s ease-in-out;
  }
  a {
    transition: all 0.2s ease-in;
    &:hover {
      background: $bright-cyan;
    }
  }
}

.dropdown.is-active {
  .dropdown-menu {
    z-index: 10;
    opacity: 1;
    transform: scaleY(1);
  }
}

.dropdown-trigger {
  width: 100%;

  transform: scale(1);
  transition: all 0.2s ease-in-out;
  &:hover {
    // transform: scale(1.02);

    box-shadow: 2px 2px 25px 1px rgba($color: #000000, $alpha: 0.3);
    .icon {
      color: $black;
    }
  }
  &:active {
    transform: scale(0.98);
  }
}

.dropdown-content {
  width: fit-content;
}

button {
  width: 100%;

  p {
    color: $white;
    &.sm {
      @extend .is-size-6;
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
      @extend .is-small;
      // border-radius: $input-radius;

      font-size: 0.2em;
    }
    &.md {
      font-size: 0.8em;
    }
    &.lg {
      @extend .is-medium;
      font-size: 1.2em;
    }
  }
}
</style>