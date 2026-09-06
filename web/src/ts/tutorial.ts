import { debounce, get_element } from "./common"

interface TutorialSteps {
  target: string,
  text: string,
}
const steps: TutorialSteps[] = [
  {
    target: "#editor-container",
    text: "This is the editor. In here you write your script. It uses the monaco editor, which you might know from VSCode, so it uses the same keybinds."
  },
  {
    target: "#output-container",
    text: "This is the output. There you can see the result of your script."
  },
  {
    target: "#top-settings",
    text: "Here you can switch what language and output to (More comming soon!). By default it uses Rhai, a scripting language related to JavaScript and Rust, and outputs as a grid, meaning that your script gets run over each pixel in a grid and returns that pixels RGB value. So a script just returning '[255, 255, 255]' would create a white image."
  },
  {
    target: "#run-btn",
    text: "Press here to run your script"
  },
  {
    target: "#middle-icon",
    text: "Or here"
  },
  {
    target: "#console",
    text: "If you're ever stuck on something you can use debug and print statements in your script and they will be shown here. For rhai those are 'print()' and 'debug()'."
  },
  {
    target: "#help-btn",
    text: "Thats all for now! But you can always revisit this tutorial under this menu. Now go ahead and write some logic and see how it results into an image."
  }
]

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

const apply_position = (pos: Position, target: HTMLElement) => {
  target.style.top = `${pos.top}px`;
  target.style.left = `${pos.left}px`;
  target.style.width = `${pos.width}px`;
  target.style.height = `${pos.height}px`;
}

let last_target: string | null = null
const show_border = (target: string) => {
  const target_pos = get_target_position(target);
  const border = get_element('#tutorial-border');
  border.classList.add('shown');
  apply_position(target_pos, border);
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

let last_target_i = 0;
export const init_tutorial = () => {
  const target_observer = new ResizeObserver(() => {
    if (last_target) {
      show_border(last_target);
      show_overlay(last_target);
    }
  });
  target_observer.observe(document.documentElement);

  show_border(steps[0]?.target as string);
  show_overlay(steps[0]?.target as string);
  setInterval(() => {
    last_target_i = (last_target_i + 1) % steps.length;
    show_border(steps[last_target_i]?.target as string);
    show_overlay(steps[last_target_i]?.target as string);
  }, 1500);
}
