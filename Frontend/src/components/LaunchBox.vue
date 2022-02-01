<template>
  <div id="LaunchBox-container" class="LaunchBox-container">
    <div style="display: none">
      <img
        id="load"
        src="../assets/images/kirby.png"
        @load="animator.drawArm(true)"
      />
      <img
        id="coin"
        src="../assets/images/coin-pink.png"
        @load="animator.drawArm(true)"
      />
    </div>
    <button
      :disabled="idle"
      class="button is-rounded is-primary m-4"
      @click="animate"
    >
      <span class="icon is-small">
        <i class="fas fa-play"></i>
      </span>
    </button>
    <b-collapse
      v-if="!idle"
      :class="[$mq, 'details', 'card', 'm-4']"
      animation="slide-prev"
      v-model="panelOpen"
    >
      <div slot="trigger" class="card-header" role="button">
        <p class="card-header-title p-2 has-text-white">Details...</p>
        <a class="card-header-icon p-2 has-text-white">
          <span v-if="panelOpen" class="icon">
            <i class="fa-chevron-up fas"> </i>
          </span>
          <span v-else>
            <i class="fa-chevron-down fas"> </i>
          </span>
        </a>
      </div>
      <div class="card-content">
        <div class="content">
          <p v-for="(message, index) in detailMessages" :key="index">
            {{ message[0] + ": " + message[1] }}
          </p>
        </div>
      </div>
    </b-collapse>

    <canvas ref="canvas" id="LaunchBox-canvas"> </canvas>
  </div>
</template>

<script>
import { Animator } from "../utils/graphical/animator";
import projCalc from "../utils/math/projectileCalc";
export default {
  props: [
    "endAngle",
    "launchTime",
    "airTime",
    "reset",
    "idle",
    "armLength",
    "detailMessages",
    "trial",
  ],
  data() {
    return {
      ctx: null,
      canvas: null,
      container: null,
      playing: false,
      panelOpen: false,
      animator: null,
    };
  },
  watch: {
    reset(newVal) {
      if (newVal) {
        this.playing = false;
        this.panelOpen = false;
        // this.animator.init(true, true);
        this.handleResize();
      }
    },
    armLength(newVal) {
      this.handleResize();
      this.animator.setArmLength(newVal);
    },
  },
  mounted() {
    this.container = document.getElementById("LaunchBox-container");
    window.addEventListener("resize", this.handleResize);
    this.animator = new Animator(this.$refs["canvas"]);

    setTimeout(() => {
      this.animator.getDT(10);
      this.handleResize();
    }, 500);
  },
  methods: {
    handleResize() {
      this.$nextTick(() => {
        this.animator.updateSize(
          this.container.clientWidth,
          this.container.clientHeight
        );
        const aspect = this.container.clientWidth / this.container.clientHeight;
        // if (this.container.clientWidth >= this.container.clientHeight) {
        this.animator.update(
          (this.armLength * 1.5 + 1) * aspect,
          this.armLength * 1.5 + 1
        );
        // } else if (this.container.clientHeight > this.container.clientWidth) {
        //   this.animator.update(
        //     this.armLength * 2,
        //     (this.armLength * 2) / aspect
        //   );
        // }

        this.animator.init(true, false);
      });
    },
    animate() {
      this.panelOpen = false;
      // anim.launch(this.ctx, this.canvas, this.endAngle, this.animTime);
      // this.animator.launch(this.endAngle, this.animTime);
      const pass = this;
      setTimeout(() => {
        pass.handleResize();
        pass.animator.launchProjectile(
          pass.endAngle,
          pass.launchTime,
          this.trial.results.s_x_max * 1.15,
          this.trial.results.s_y_max * 1.15,
          pass.airTime,
          this.trial.targetPoint,
          projCalc.calcPath,
          this.trial.results
        );
      }, 500);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/sass/main.scss";
#LaunchBox-canvas {
  border-radius: inherit;
  display: grid;
  place-items: center;
}
.button {
  position: absolute;
  top: 0;
  left: 0;
}
.details {
  position: absolute;
  top: 0;
  right: 0;
  max-width: 60%;
  background-color: $primary;
  transform: scale(1);
  transition: all 0.2s ease-in-out;
  box-shadow: none;
  &:active {
    transform: scale(0.95);
  }
  &:hover {
    // transform: scale(1.02);

    box-shadow: 2px 2px 25px 1px rgba($color: #000000, $alpha: 0.3);
  }
  .card-content {
    max-height: 350px;
    overflow: auto;
  }
}
</style>