import { Output, OutputDoc } from "../../types";

import { init, clear, deinit } from "./lifecycle";
import { run } from "./run";

const docs: OutputDoc = {
  name: 'Plot',
  summary: `Plot an x value to a y value using the script`,
  variables: [
    {
      name: "x",
      doc: "X value"
    },
  ],
}

export const plot: Output = {
  pipeline: run,
  clear: clear,
  init: init,
  deinit: deinit,
  docs: docs,
};
