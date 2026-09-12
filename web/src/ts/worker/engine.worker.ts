/// <reference lib="webworker" />

import init, { run_grid, run_plot, ScriptType, ErrorOutput, WasmResponse, PlotSettings, GridSettings } from "../../../pkg/wasm/core_engine";
import { PlotSuccessReturn } from "../../../pkg/wasm/core_engine";
import { GridSuccessReturn } from "../../../pkg/wasm/core_engine";
import { WorkerRequest, WorkerResponse, WorkerStatus, OutputType, Language, OutputOutputs } from "../types";

let wasm_loaded = init();

const convert_language = (lang: Language): ScriptType => {
  switch (lang) {
    case Language.RHAI:
      return ScriptType.Rhai;

    default:
      throw new Error(`Could not convert ${lang} to a ScriptType for WASM`);
  }
}

self.onmessage = async (event) => {
  console.log("wasm web worker received a message");
  await wasm_loaded;
  const req = event.data as WorkerRequest;
  const lang = convert_language(req.state.language);
  let wasm_err: ErrorOutput;
  try {
    switch (req.state.output_type) {
      case OutputType.GRID:
        const wasm_response = run_grid(req.script, lang, req.config as GridSettings);
        if ("Ok" in wasm_response) {
          const grid_ok: GridSuccessReturn = wasm_response.Ok;
          const response: WorkerResponse = {
            status: WorkerStatus.SUCCESS,
            data: grid_ok.pixels,
            logs: grid_ok.logs,
            id: req.id as string,
          }
          self.postMessage(response);
          return;
        }
        wasm_err = wasm_response.Error
        break

      case OutputType.PLOT:
        {
          const wasm_response = run_plot(req.script, lang, req.config as PlotSettings);
          if ("Ok" in wasm_response) {
            const grid_ok: PlotSuccessReturn = wasm_response.Ok;
            const response: WorkerResponse = {
              status: WorkerStatus.SUCCESS,
              data: grid_ok.points,
              logs: grid_ok.logs,
              id: req.id as string,
            }
            self.postMessage(response);
            return;
          }
          wasm_err = wasm_response.Error
        }
        break

      default:
        throw new Error(`Unknown output type: ${req.state.output_type}`);
    }
    const response: WorkerResponse = {
      status: WorkerStatus.ERROR,
      error: wasm_err,
      id: req.id as string,
    }
    self.postMessage(response);

  } catch (error) {
    console.error(`caught unexpected error from WASM: ${error}`);
    const response: WorkerResponse = {
      status: WorkerStatus.FAILURE,
      error: error as string,
      id: req.id as string,
    }
    self.postMessage(response);
  }
}
