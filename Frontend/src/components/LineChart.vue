

<script>
import { Line, mixins } from "vue-chartjs";
import Chart from "chart.js";
Chart.Legend.prototype.afterFit = function () {
  this.height = this.height + 20;
};
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ["xLabel", "yLabel", "options", "adaptiveScale"],
  data() {
    return {
      htmlLegend: null,
    };
  },
  watch: {
    yLabel(newVal) {
      this.updateChart();
    },
    adaptiveScale(newVal) {
      this.updateChart();
    },
  },
  methods: {
    updateChart() {
      const preLoadOpts = { ...this.options };
      preLoadOpts.scales.yAxes[0].scaleLabel.labelString = this.yLabel;
      preLoadOpts.scales.xAxes[0].scaleLabel.labelString = this.xLabel;
      preLoadOpts.scales.yAxes[0].ticks.beginAtZero = this.adaptiveScale;
      // this.chartData is created in the mixin.
      // If you want to pass options please create a local options object
      this.renderChart(this.chartData, preLoadOpts);
    },
  },
  mounted() {
    this.updateChart();
  },
};
</script>
