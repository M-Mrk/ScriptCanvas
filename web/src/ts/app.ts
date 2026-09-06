import '@fontsource-variable/jetbrains-mono';

import wasm_init from "../../pkg/wasm/core_engine";
import { init_workers } from "./worker/executor"
import { init_state } from "./state";
import { init_editor } from "./editor";
import { init_controls } from "./interaction";
import { init_settings } from "./settings";
import { init_ui } from "./ui";
import { init_help } from './help';
import { init_tutorial } from './tutorial';


document.addEventListener('DOMContentLoaded', async () => {
  init_ui();
  init_help();
  init_state();
  init_editor();
  init_workers();
  await wasm_init();
  init_controls();
  init_settings();
  init_tutorial();
});
