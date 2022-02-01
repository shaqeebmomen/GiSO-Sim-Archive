<template>
  <!-- <div :class="['container', $mq]"> -->
  <b-carousel-list
    :gray="false"
    :opacity="false"
    iconPack="fa"
    iconPrev="arrow-left"
    iconNext="arrow-right"
    :data="trials"
    :items-to-show="slideMap[$mq]"
    v-model="currentIndex"
  >
    <template slot="item" slot-scope="list">
      <div :class="['card', 'slide', $mq]" @click="updateActiveTrial(list)">
        <div
          :class="[
            activeTrialNum === list.trialNum ? 'active' : '',
            'card-content',
            'p-3',
          ]"
        >
          <!-- <img class="kirby-star" src="../assets/images/kirby-star.png" />
          <p class="trial">Trial: {{ list.trialNum }}</p>
          <p class="score">Score: {{ list.results.exitOmega.toFixed(3) }}</p>
          <p class="name">{{ list.userName }}</p> -->
          <div class="media">
            <div class="media-left">
              <figure class="image is-48x48">
                <img src="../assets/images/kirby-star.png" />
              </figure>
            </div>
            <div class="media-content">
              <p class="trial">Trial: {{ list.trialNum }}</p>
              <p class="score">
                Score:
                {{ list.score.toFixed(3) }}
              </p>
              <p class="name">{{ list.userName }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </b-carousel-list>
  <!-- </div> -->
</template>

<script>
export default {
  props: ["trials", "activeTrialNum", "submission"],

  data() {
    return {
      currentIndex: 0,
      slideMap: {
        sm: 2,
        md: 3,
        lg: 5,
      },
    };
  },
  computed: {
    isNav() {
      return this.$mq === "sm" ? false : true;
    },
  },
  watch: {
    submission(newVal) {
      if (newVal) {
        this.currentIndex = this.activeTrialNum;
      }
    },
    activeTrialNum(newVal) {
      this.currentIndex =
        this.activeTrialNum - 1 - Math.floor(this.slideMap[this.$mq] / 2);
    },
  },
  mounted() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        this.currentIndex++;
      }
      if (event.key === "ArrowLeft") {
        this.currentIndex--;
      }
    });
  },
  methods: {
    updateActiveTrial(trial) {
      this.$emit("updateActiveTrial", trial);
    },
  },
};
</script>

<style lang="scss" scoped >
@import "@/assets/sass/branding.scss";
@import "@/assets/sass/main.scss";

.slide {
  height: 100%;
}
.card {
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  transform: scale(1);
  overflow: visible;
  &.sm {
    min-width: 100px;
  }
  &.md,
  &.lg {
    min-width: 150px;
  }
  &:hover {
    z-index: 5;
    transform: scale(1.01);
    box-shadow: 2px 2px 25px 5px rgba($color: #000000, $alpha: 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  .active {
    @extend .p-2;
    outline: none;
    border: 4px solid $bright-red;
    z-index: 3;
  }
}

.card-content {
  border-radius: inherit;
  height: 100%;
  column-gap: 0.8em;
  display: grid;
  place-items: center;
  .media {
    width: 100%;
  }
}

.kirby-star {
  grid-column: 1;
  grid-row: 1/4;
}

.trial {
  grid-column: 2;
  grid-row: 1;
}
.score {
  grid-column: 2;
  grid-row: 2;
}
.name {
  grid-column: 2;
  grid-row: 3;
}
</style>