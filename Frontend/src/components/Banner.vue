<template>
  <div class="banner-container">
    <h1 :class="['ml-2', 'mb-0', 'has-text-white', 'title', $mq]">
      GiSO SIMULATOR{{ ": " + pagetitle }}
    </h1>
    <img class="corner-image mr-2" :src="source" alt="" />
  </div>
</template>

<script>
export default {
  props: ["pagetitle"],
  computed: {
    source() {
      if (this.$route.name === "Launch") {
        return require("../assets/images/kirbyflying.gif");
      } else if (this.$route.name === "Lift") {
        return require("../assets/images/donkeykong.gif");
      }
    },
  },
};
</script>

<style lang="scss" scoped >
@import "../assets/sass/main.scss";
.banner-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.corner-image {
  height: 100%;
  transform: scaleX(-1);
}

h1 {
  &.sm {
    @extend .is-size-3;
  }
  &.md {
    @extend .is-size-2;
  }
  &.lg {
    @extend .is-size-1;
  }
}
</style>