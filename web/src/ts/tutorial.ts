import { get_element } from "./common"

enum BoxPosition {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
  Center = "center",
}

interface TutorialStep {
  target: string,
  text: string,
  box: BoxPosition,
}
const steps: TutorialStep[] = [
  {
    target: "#tutorial-box",
    text: "Hi! Welcome to PixelMatrix. An app made to experiment with logic and use unique output types. The core idea is to run a script multiple times with a different scope to create an output. It is inspired by the game replicube. Lets go over the basics to create a output.",
    box: BoxPosition.Center,
  },
  {
    target: "#editor-container",
    text: `The default output is Grid, meaning that the script is evaluated over a grid of pixels and it returns the RGB value of that Pixel. The script has access to the pixels x and y coordinates, aswell as the resolution.

    So a script just returning "[255, 255, 255]" would result in a white grid`,
    box: BoxPosition.Center,
  },
  {
    target: "#editor-container",
    text: "This is the editor. In here you write your script. You get access to all sorts of stuff from the output. For example Grid exposes which coordinate the script is on and the resolution and it expects a return of the pixels RGB value. It also uses the monaco editor, which you might know from VSCode and so it uses the same keybinds.",
    box: BoxPosition.Right,
  },
  {
    target: "#output-container",
    text: "This is the output. There you can see the result of your script.",
    box: BoxPosition.Left,
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
    target: "#top-settings",
    text: "Here you can switch what language and output to use (More coming soon!). By default it uses Rhai, a scripting language related to JavaScript and Rust, and outputs as a grid, meaning that your script gets run over each pixel in a grid and returns that pixels RGB value. So a script just returning '[255, 255, 255]' would create a white image.",
    box: BoxPosition.Bottom,
  },
  {
    target: "#output-toolbar",
    text: "Here are some settings to tweak the output.",
    box: BoxPosition.Left,
  },
  {
    target: "#console",
    text: "If you're ever stuck on something you can use debug and print statements in your script and they will be shown here. For rhai those are 'print()' and 'debug()'.",
    box: BoxPosition.Top,
  },
  {
    target: "#help-btn",
    text: "In here you can look up functions and exposed variables for your script, show tool tips and revisit this tutorial.",
    box: BoxPosition.Center,
  },
  {
    target: "#tutorial-box",
    text: "Thats all for now! Now go ahead and write some logic and see how it results into an image.",
    box: BoxPosition.Center,
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

const end_tutorial = () => {
  const ov_container = get_element('#tutorial-overlay-container');
  ov_container.classList.remove('shown');

  const border = get_element('#tutorial-border');
  border.classList.remove('shown');

  const box = get_element('#tutorial-box');
  box.classList.remove('shown');

  window.localStorage.setItem('tutorial-done', 'true');
};

export const start_tutorial = () => {
  current_step = 0;
  // No tutorial implemented for smaller screens using tab layout
  if (800 >= window.innerWidth) {
    end_tutorial();
  }

  show_step(steps[current_step] as TutorialStep)
};

export const init_tutorial = () => {
  const target_observer = new ResizeObserver(() => {
    if (last_target) {
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
  // TODO: Trigger on first visit and then not again and add show tutorial button to '?' menu!
}
