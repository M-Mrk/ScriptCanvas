import { Output, OutputType, Language, AppState } from "./types";
import { grid } from "./outputs/grid";
import { plot } from "./outputs/plot";

const app_state: AppState = {
  output_type: OutputType.GRID,
  language: Language.RHAI,
  hot_reload: false,
  disable_tip: false,
};

export const get_state = () => ({ ...app_state });

let callbacks: Function[] = [];
export const register_state_change_callback = (fn: Function) => {
  callbacks.push(fn);
}

export const update_state = (new_state: AppState) => {
  const prior_state = get_state();

  Object.assign(app_state, new_state);

  if (prior_state.output_type != app_state.output_type) {
    const old_output = match_output(prior_state.output_type);
    old_output.deinit();

    const new_output = match_output(app_state.output_type);
    new_output.init();
  }

  window.localStorage.setItem("app-state", JSON.stringify(app_state));
  for (const fn of callbacks) {
    fn();
  }
};

export const get_output = () => {
  return match_output(app_state.output_type);
};

const match_output = (output_type: OutputType): Output => {
  switch (output_type) {
    case OutputType.GRID:
      return grid;

    case OutputType.PLOT:
      return plot;

    default:
      throw new Error(`Couldn't get Output interface from output_type of ${output_type}`);
  }
};

export const init_state = () => {
  const saved = window.localStorage.getItem("app-state");
  if (saved) {
    update_state(JSON.parse(saved));
  }

  const output = match_output(app_state.output_type);
  output.init();
};
