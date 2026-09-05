import { GridSettings } from "../../../../pkg/wasm/core_engine";
import { get_element, html } from "../../common";
import { clear_output, show_last_draw } from "./draw";

const settings_container = get_element<HTMLDivElement>('#output-toolbar');
const output_inner = get_element<HTMLDivElement>('#output-inner');
const id_res_x = "#setting-grid-res-x";
const id_res_y = "#setting-grid-res-y";
const id_clamp = "#setting-grid-clamp";
const id_blur = "#setting-grid-blur";
const id_square = "#setting-grid-square";

export let settings: GridSettings = {
  res_x: 16,
  res_y: 16,
  clamp: false,
  blur: false,
  square: false,
};

const update_settings_from_page = () => {
  const setting_res_x = get_element<HTMLInputElement>(id_res_x);
  const setting_res_y = get_element<HTMLInputElement>(id_res_y);

  if (!setting_res_x.value || !setting_res_y.value) {
    console.warn(`No resolution set. Defaulting to 16x16.`);
    settings.res_x = 16;
    settings.res_y = 16;
    return
  }

  let res_x = Number(setting_res_x.value);
  let res_y = Number(setting_res_y.value);
  if (res_x < 1 || res_y < 1) {
    console.warn(`Set resolution (${res_x}x${res_y}) is not possible. Defaulting to 16x16.`);
    res_x = 16;
    res_y = 16;
  }
  settings.res_x = res_x;
  settings.res_y = res_y;

  const setting_clamp = get_element<HTMLInputElement>(id_clamp);
  settings.clamp = setting_clamp.checked;

  const setting_blur = get_element<HTMLInputElement>(id_blur);
  settings.blur = setting_blur.checked;

  const setting_square = get_element<HTMLInputElement>(id_square);
  settings.square = setting_square.checked;

  window.localStorage.setItem('grid-settings', JSON.stringify(settings));
};

const add_settings = () => {
  const saved_settings = window.localStorage.getItem('grid-settings');
  if (saved_settings) {
    settings = JSON.parse(saved_settings);
  }

  const settings_html = html`
    <label class="input-wrapper">
      Resolution:
      <label class="number" data-tip="Sets the width of the output, so the x resolution"> 
        <input type="number" name="Resolution width" value="${settings.res_x}" min="1" step="1" id="${id_res_x.slice(1)}">
      </label>
        x
      <label class="number" data-tip="Sets the height of the output, so the y resolution.">
      <input type="number" name="Resolution height" value="${settings.res_y}" min="1" step="1" id="${id_res_y.slice(1)}">
      </label>
    </label>
    <label class="checkbox" data-tip="Will clamp output values larger than 255 to 255">
      <input type="checkbox" name="Auto clamp output" id="${id_clamp.slice(1)}">
      <span>Auto clamp output</span>
    </label>
    <label class="checkbox" data-tip="Enables the browsers image smoothing, so results may vary. Works best for medium resoultions and gradients.">
      <input type="checkbox" name="Blur" id="${id_blur.slice(1)}">
      <span>Blur</span>
    </label>
    <label class="checkbox" data-tip="Make output always a square by stretching pixels.">
      <input type="checkbox" name="Square output" id="${id_square.slice(1)}">
      <span>Square Output</span>
    </label>
    `

  if (!settings_container) {
    console.error("Settings container not found");
    return;
  }
  settings_container.innerHTML = settings_html;

  if (settings.clamp) {
    const setting_clamp = get_element<HTMLInputElement>(id_clamp);
    setting_clamp.checked = true;
  }

  if (settings.blur) {
    const setting_blur = get_element<HTMLInputElement>(id_blur);
    setting_blur.checked = true;
  }

  if (settings.square) {
    const setting_square = get_element<HTMLInputElement>(id_square);
    setting_square.checked = true;
  }

  settings_container.addEventListener('input', update_settings_from_page);
};


const obs = new ResizeObserver(show_last_draw);
const add_output = () => {
  const canvas_html = html`
    <canvas id="canvas-output"></canvas>
  `
  output_inner.innerHTML = canvas_html;
  obs.observe(document.documentElement);
}

export const init = () => {
  add_settings();
  add_output();
};

export const clear = () => {
  clear_output();
}

export const deinit = () => {
  settings_container.removeEventListener('input', update_settings_from_page);
  obs.disconnect();
};
