import { settings } from "./lifecycle";
import { full_draw } from "./draw";
import { execute } from "../../worker/executor";
import { get_state } from "../../state";
import { WorkerRequest } from "../../types";
import { ErrorOutput } from "../../../../pkg/wasm/core_engine";
import { GlueXYPair } from "../../../../pkg/wasm/core_engine";

export const run = async (script: string): Promise<ErrorOutput | null> => {
  let output;
  console.time("interpreting rhai script");
  try {
    const msg: WorkerRequest = {
      script: script,
      state: get_state(),
      config: settings,
    }
    output = await execute(msg);
  } catch (error) {
    return error as ErrorOutput;
  } finally {
    console.timeEnd("interpreting rhai script");
  }
  console.dirxml(output);
  full_draw(output as GlueXYPair[], settings);
  return null;
};
