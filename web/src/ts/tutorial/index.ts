import { get_element } from "../common"
import { get_editor } from "../editor";
import { run_pipeline } from "../interaction";
import { grid_add_settings } from "../outputs/grid/lifecycle";
import { init_settings } from "../settings";
import { get_output, get_state, update_state } from "../state";
import { AppState, Language, OutputType } from "../types";

import { BoxPosition, TutorialStep, steps } from "./steps";

interface Position {
  top: number,
  left: number,
  right: number,
  bottom: number,
  width: number,
  height: number,
}
const get_target_position = (query: string): Position => {
  const target = get_element(query);
  const box = target.getBoundingClientRect();

  const top = Math.max(box.top, 0);
  const left = Math.max(box.left, 0);
  const right = Math.min(box.right, window.innerWidth);
  const bottom = Math.min(box.bottom, window.innerHeight);

  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

let last_target: string | null = null
const show_border = (target: string) => {
  const target_pos = get_target_position(target);
  const border = get_element('#tutorial-border');
  border.classList.add('shown');

  border.style.top = `${target_pos.top}px`;
  border.style.left = `${target_pos.left}px`;
  border.style.width = `${target_pos.width}px`;
  border.style.height = `${target_pos.height}px`;

  last_target = target;
}


const show_overlay = (target: string) => {
  const target_pos = get_target_position(target);
  const ov_container = get_element('#tutorial-overlay-container');
  const ov_top = get_element('#tutorial-overlay-top');
  const ov_right = get_element('#tutorial-overlay-right');
  const ov_bottom = get_element('#tutorial-overlay-bottom');
  const ov_left = get_element('#tutorial-overlay-left');

  const viewport_width = window.innerWidth;
  const viewport_height = window.innerHeight;

  ov_container.classList.add('shown');
  ov_top.style.bottom = `${viewport_height - target_pos.top}px`;

  ov_right.style.left = `${target_pos.right}px`;
  ov_right.style.top = `${target_pos.top}px`;
  ov_right.style.bottom = `${viewport_height - target_pos.bottom}px`;

  ov_bottom.style.top = `${target_pos.bottom}px`;

  ov_left.style.right = `${viewport_width - target_pos.left}px`;
  ov_left.style.top = `${target_pos.top}px`;
  ov_left.style.bottom = `${viewport_height - target_pos.bottom}px`;
}

const show_box = (step: TutorialStep) => {
  const box = get_element('#tutorial-box');
  const content = get_element('#tutorial-content');
  box.classList.add('shown');
  content.innerText = step.text;

  const options = [BoxPosition.Top, BoxPosition.Right, BoxPosition.Bottom, BoxPosition.Left, BoxPosition.Center];
  for (let opt of options) {
    box.classList.remove(opt);
  }

  box.classList.remove('left');
  box.classList.add(step.box);
}

const show_step = (step: TutorialStep) => {
  if (step.script) {
    get_editor().setValue(step.script);
  }

  if (step.run_script) {
    run_pipeline();
  }

  show_box(step);
  setTimeout(() => {
    show_border(step.target);
    show_overlay(step.target);
  }, 200);
}

const next_button = get_element('#tutorial-next-btn');
const previous_button = get_element('#tutorial-previous-btn');
const close_button = get_element('#tutorial-close-btn');
let current_step = 0;
const new_step = (change: number) => {
  current_step = (current_step + change);
  if (current_step == 0) {
    previous_button.classList.add("disabled");
  } else if (current_step < 0) {
    current_step = 0;
  } else {
    previous_button.classList.remove("disabled");
  }

  // Next was pressed on last step
  if (current_step == steps.length) {
    end_tutorial();
    return;
  }

  show_step(steps[current_step] as TutorialStep);
}

let script_before: string | null = null;
let grid_settings_before: string | null = null;
let app_state_before: AppState | null = null;
let tutorial_active = false;
export const start_tutorial = () => {
  if (tutorial_active) {
    return;
  }
  tutorial_active = true;
  // store script
  try {
    script_before = get_editor().getValue();
  } catch { }

  get_output().clear();

  current_step = 0;
  // No tutorial implemented for smaller screens using tab layout
  if (800 >= window.innerWidth) {
    end_tutorial();
  }

  // store current app state and load demo one
  app_state_before = get_state();
  update_state({
    output_type: OutputType.GRID,
    language: Language.RHAI,
    hot_reload: false,
    disable_tip: false,
  })
  init_settings();

  // store current grid settins and load demo ones
  grid_settings_before = window.localStorage.getItem('grid-settings');
  window.localStorage.setItem('grid-settings', '{"res_x":32,"res_y":32,"clamp":true,"blur":false,"square":false}');
  grid_add_settings();

  show_step(steps[current_step] as TutorialStep)
};

const end_tutorial = () => {
  const ov_container = get_element('#tutorial-overlay-container');
  ov_container.classList.remove('shown');

  const border = get_element('#tutorial-border');
  border.classList.remove('shown');

  const box = get_element('#tutorial-box');
  box.classList.remove('shown');

  window.localStorage.setItem('tutorial-done', 'true');

  // restore script
  if (script_before) {
    const editor = get_editor();
    editor.setValue(script_before);
  }

  // restore app state
  if (app_state_before) {
    update_state(app_state_before);
    init_settings();
  }

  // restore grid settings
  if (grid_settings_before) {
    window.localStorage.setItem('grid-settings', grid_settings_before);
    grid_add_settings();
  }

  tutorial_active = false;
};

export const init_tutorial = () => {
  const target_observer = new ResizeObserver(() => {
    if (tutorial_active && last_target) {
      show_border(last_target);
      show_overlay(last_target);
    }
  });
  target_observer.observe(document.documentElement);

  next_button.addEventListener('click', () => { new_step(1) });
  previous_button.addEventListener('click', () => { new_step(-1) });
  close_button.addEventListener('click', end_tutorial);

  if (window.localStorage.getItem('tutorial-done') != 'true') {
    start_tutorial();
  }
}
