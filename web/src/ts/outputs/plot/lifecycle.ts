import { PlotSettings } from "../../../../pkg/wasm/core_engine";
import { get_element, html } from "../../common";
import { clear_output } from "./draw";

const settings_container = get_element<HTMLDivElement>('#output-toolbar');
const output_inner = get_element<HTMLDivElement>('#output-inner');
const id_start_x = "#setting-grid-res-x";
const id_end_x = "#setting-grid-res-y";
const id_step = "#setting-grid-clamp";

export let settings: PlotSettings = {
  start_x: 0,
  end_x: 20,
  step_x: 1,
};

const update_settings_from_page = () => {
  const setting_start_x = get_element<HTMLInputElement>(id_start_x);
  const setting_end_x = get_element<HTMLInputElement>(id_end_x);
  const setting_step = get_element<HTMLInputElement>(id_step);

  settings.start_x = parseFloat(setting_start_x.value);
  settings.end_x = parseFloat(setting_end_x.value);
  settings.step_x = parseFloat(setting_step.value);

  window.localStorage.setItem('plot-settings', JSON.stringify(settings));
};

export const plot_add_settings = () => {
  const saved_settings = window.localStorage.getItem('plot-settings');
  if (saved_settings) {
    settings = JSON.parse(saved_settings);
  }

  const settings_html = html`
    <label class="input-wrapper">
      <label class="number" data-tip="Sets the start value of x"> 
        Start x:
        <input type="number" name="Start x value" value="${settings.start_x}" step="1" id="${id_start_x.slice(1)}">
      </label>
      <label class="number" data-tip="Sets the end value of x"> 
        End x:
        <input type="number" name="End x value" value="${settings.end_x}" step="1" id="${id_end_x.slice(1)}">
      </label>
      <label class="number" data-tip="Sets the step"> 
        Step:
        <input type="number" name="Step value" value="${settings.step_x}" step="1" id="${id_step.slice(1)}">
      </label>
    </label>
    `

  settings_container.innerHTML = settings_html;
  settings_container.addEventListener('input', update_settings_from_page);
};


const add_output = () => {
  const canvas_html = html`
    <canvas id="canvas-output"></canvas>
  `
  output_inner.innerHTML = canvas_html;
}

export const init = () => {
  plot_add_settings();
  add_output();
};

export const clear = () => {
  clear_output();
}

export const deinit = () => {
  settings_container.removeEventListener('input', update_settings_from_page);
  settings_container.innerHTML = "";
  output_inner.innerHTML = "";
};
