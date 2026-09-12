import { GlueXYPair, PlotSettings } from "../../../../pkg/wasm/core_engine";
import { get_element } from "../../common";

import Chart from 'chart.js/auto';

export const full_draw = (points: GlueXYPair[], settings: PlotSettings) => {
  console.time("drawing");
  const canvas = get_element<HTMLCanvasElement>('#canvas-output');
  new Chart(canvas, {
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
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Y',
          }
        }
      }
    }
  });
  console.timeEnd("drawing");
};


export const clear_output = () => {
};
