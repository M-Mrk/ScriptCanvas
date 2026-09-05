import { get_element } from "./common";
import { get_editor } from "./editor";

const top_toggle_btn = get_element<HTMLDivElement>('#top-menu-btn');
const top_interactives = get_element<HTMLDivElement>('#top-interactives');

const tabbar = get_element<HTMLDivElement>('#tabbar');
const tabbar_code = get_element<HTMLDivElement>('#tabbar-code');
const tabbar_output = get_element<HTMLDivElement>('#tabbar-output');
const editor_container = get_element<HTMLDivElement>('#editor-container');
const output_container = get_element<HTMLDivElement>('#output-container');

const init_interactives = () => {
  const close_handler = (event: PointerEvent) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }
    // Too unreliable
    // if (!target.contains(top_interactives)) {
    //   document.removeEventListener('click', close_handler);
    //   top_interactives.classList.remove('shown');
    // }
  }
  top_toggle_btn.addEventListener('click', () => {
    if (top_interactives.classList.contains('shown')) {
      top_interactives.classList.remove('shown');
      document.removeEventListener('click', close_handler);
    } else {
      setTimeout(() => {
        document.addEventListener('click', close_handler);
      }, 100);
      top_interactives.classList.add('shown');
    }
  });
};

const tabbar_switch_code = () => {
  tabbar_code.classList.add('selected');
  tabbar_output.classList.remove('selected');

  editor_container.classList.remove('hidden');
  output_container.classList.add('hidden');
  try {
    const editor = get_editor();
    editor.layout();
  } catch { }
};

const tabbar_switch_output = () => {
  tabbar_code.classList.remove('selected');
  tabbar_output.classList.add('selected');

  editor_container.classList.add('hidden');
  output_container.classList.remove('hidden');
};

const init_tabbar = () => {
  tabbar_switch_output();
  tabbar.addEventListener('click', (event) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }
    if (target.contains(tabbar_code)) {
      tabbar_switch_code();
    } else if (target.contains(tabbar_output)) {
      tabbar_switch_output();
    }
  });
};

export const init_mobile = () => {
  init_interactives();
  init_tabbar();
};
