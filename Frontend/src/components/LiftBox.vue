<template>
  <div id="LiftBox-container" class="LiftBox-container">
    <div style="display: none">
      <img
        id="load"
        src="../assets/images/barrel.png"
        width="10"
        height="10"
        style="border-radius: 5px"
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
            <span class="has-text-weight-bold">{{ message[0] + ": " }}</span>
            <span class="is-italic">
              {{ message[1] }}
            </span>
          </p>
        </div>
      </div>
    </b-collapse>

    <canvas ref="canvas" id="LiftBox-canvas"> </canvas>
  </div>
</template>

<script>
import anim from "../utils/graphical/animation";
import Animator from "../utils/graphical/animator";
export default {
  props: [
    "endAngle",
    "animTime",
    "reset",
    "idle",
    "armLength",
    "detailMessages",
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
        anim.init(this.ctx, this.canvas, true);
      }
    },
    armLength(newVal) {
      anim.armState.length = newVal;
      anim.init(this.ctx, this.canvas, true);
    },
  },
  mounted() {
    
    setTimeout(() => {
      anim.getDT(10);
    }, 1000);
    this.container = document.getElementById("LiftBox-container");
    this.ctx = this.$refs["canvas"].getContext("2d");
    this.ctx.globalCompositeOperation = "source-over";
    this.canvas = document.getElementById("LiftBox-canvas");
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.animator = new Animator(this.ctx)
  },
  methods: {
    handleResize() {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
      // this.canvas.height = this.container.clientWidth;
      this.$nextTick(() => {
        anim.init(this.ctx, this.canvas);
        anim.drawArm(this.ctx);
      });
    },
    animate() {
      this.panelOpen = false;
      anim.launch(this.ctx, this.canvas, this.endAngle, this.animTime);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/sass/main.scss";
#LiftBox-canvas {
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