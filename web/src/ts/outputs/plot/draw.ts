import { GlueXYPair, PlotSettings } from "../../../../pkg/wasm/core_engine";
import { get_element } from "../../common";

import Chart from 'chart.js/auto';

let last_chart: Chart;
export const full_draw = (points: GlueXYPair[], settings: PlotSettings) => {
  console.time("drawing");
  if (last_chart) {
    last_chart.destroy();
  }

  const canvas = get_element<HTMLCanvasElement>('#canvas-output');

  const styles = window.getComputedStyle(document.body);
  const bg_color_var = styles.getPropertyValue("--output-bg");
  const bg_color = bg_color_var ? bg_color_var : "white";
  const txt_color_var = styles.getPropertyValue("--output-txt");
  const txt_color = txt_color_var ? txt_color_var : "gray";

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [{
        data: points,
        tension: 0.2,
        showLine: true,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: 'bottom',
          title: {
            display: true,
            text: 'X',
            color: txt_color,
          },
          grid: {
            color: bg_color,
          },
          ticks: {
            color: txt_color,
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Y',
            color: txt_color,
          },
          grid: {
            color: bg_color,
          },
          ticks: {
            color: txt_color,
          }
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const y_val = context.parsed.y;
              return `Y: ${y_val?.toPrecision(4)}`;
            },
            title: function(context) {
              const x_ctx = context[0];
              if (!x_ctx) {
                return "error";
              }
              const x_val = x_ctx.parsed.x;
              return `X: ${x_val?.toPrecision(4)}`;
            }
          }
        }
      }
    }
  });
  last_chart = chart;
  console.timeEnd("drawing");
};


export const clear_output = () => {
  if (last_chart) {
    last_chart.clear();
  }
};
