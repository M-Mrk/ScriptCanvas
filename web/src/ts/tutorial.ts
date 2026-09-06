import { debounce, get_element } from "./common"

enum BoxPosition {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

interface TutorialStep {
  target: string,
  text: string,
  box: BoxPosition,
}
const steps: TutorialStep[] = [
  {
    target: "#editor-container",
    text: "This is the editor. In here you write your script. It uses the monaco editor, which you might know from VSCode, so it uses the same keybinds.",
    box: BoxPosition.Right,
  },
  {
    target: "#output-container",
    text: "This is the output. There you can see the result of your script.",
    box: BoxPosition.Left,
  },
  {
    target: "#top-settings",
    text: "Here you can switch what language and output to (More comming soon!). By default it uses Rhai, a scripting language related to JavaScript and Rust, and outputs as a grid, meaning that your script gets run over each pixel in a grid and returns that pixels RGB value. So a script just returning '[255, 255, 255]' would create a white image.",
    box: BoxPosition.Bottom,
  },
  {
    target: "#run-btn",
    text: "Press here to run your script",
    box: BoxPosition.Bottom,
  },
  {
    target: "#middle-icon",
    text: "Or here",
    box: BoxPosition.Bottom,
  },
  {
    target: "#console",
    text: "If you're ever stuck on something you can use debug and print statements in your script and they will be shown here. For rhai those are 'print()' and 'debug()'.",
    box: BoxPosition.Top,
  },
  {
    target: "#help-btn",
    text: "Thats all for now! But you can always revisit this tutorial under this menu. Now go ahead and write some logic and see how it results into an image.",
    box: BoxPosition.Bottom,
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

const show_box = (step: TutorialStep) => {
  const box = get_element('#tutorial-box');
  box.classList.add('shown');
  box.innerText = step.text;

  const options = [BoxPosition.Top, BoxPosition.Right, BoxPosition.Bottom, BoxPosition.Left];
  for (let opt of options) {
    box.classList.remove(opt);
  }

  box.classList.remove('left');
  box.classList.add(step.box);
}

const show_step = (step: TutorialStep) => {
  show_border(step.target);
  show_overlay(step.target);
  show_box(step);
}

let last_step = 0;
export const init_tutorial = () => {
  const target_observer = new ResizeObserver(() => {
    if (last_target) {
      show_border(last_target);
      show_overlay(last_target);
    }
  });
  target_observer.observe(document.documentElement);

  show_step(steps[0] as TutorialStep)
  setInterval(() => {
    last_step = (last_step + 1) % steps.length;
    show_step(steps[last_step] as TutorialStep)
  }, 1500);
}
