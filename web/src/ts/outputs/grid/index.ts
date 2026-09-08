import { Output, OutputDoc } from "../../types";

import { init, clear, deinit } from "./lifecycle";
import { run } from "./run";

const docs: OutputDoc = {
  name: 'Grid',
  summary: `A grid of pixels, where the script runs over each and outputs the RGB value. Expects an array of 3 8-bit unsigned integers, so any integer between 0 and 255.`,
  variables: [
    {
      name: "x",
      doc: "X coordinate of the pixel. 0 indexed, so for a resolution of 32 x will be between 0 and 31."
    },
    {
      name: "y",
      doc: "Y coordinate of the pixel. 0 indexed, so for a resolution of 32 y will be between 0 and 31."
    },
    {
      name: "res_x",
      doc: "Directly maps to the X resolution/width set"
    },
    {
      name: "res_y",
      doc: "Directly maps to the Y resolution/height set"
    }
  ],
}

export const grid: Output = {
  pipeline: run,
  clear: clear,
  init: init,
  deinit: deinit,
  docs: docs,
};
