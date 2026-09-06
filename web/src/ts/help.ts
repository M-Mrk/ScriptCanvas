import { get_element } from "./common";
import { start_tutorial } from "./tutorial";

/* INFO: tip box */
const tip_box = get_element<HTMLDivElement>('#tip-box');
const tip_close = get_element<HTMLDivElement>('#tip-close-btn');
const tip_content = get_element('#tip-content');
const tip_show_delay = 2000;
const tip_hide_delay = 1200;
const hide_tip = () => {
  tip_box.classList.remove('shown');
}

const show_tip = (text: string) => {
  tip_content.innerText = text;
  tip_box.classList.add('shown');
}

const on_tip_element = (element: HTMLElement, help: string) => {
  setTimeout(() => {
    if (!element.matches(':hover')) {
      return;
    }
    show_tip(help);

    let handling_leave = false;
    const leave_handler: (() => void) = () => {
      if (handling_leave) {
        return;
      }
      handling_leave = true;

      setTimeout(() => {
        handling_leave = false;
        if (element.matches(':hover') || tip_box.matches(':hover')) {
          // cursor still above tip related element
          return;
        }

        element.removeEventListener('mouseleave', leave_handler);
        tip_box.removeEventListener('mouseleave', leave_handler);
        hide_tip();
      }, tip_hide_delay);
    }
    element.addEventListener('mouseleave', leave_handler);
    tip_box.addEventListener('mouseleave', leave_handler);
  }, tip_show_delay);
};

const init_tip = () => {
  tip_close.addEventListener('click', hide_tip);

  document.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) {
      console.debug("dropping because not an HTML Element");
      return;
    }
    let tip;
    tip = target.getAttribute('data-tip');
    if (!tip) {
      tip = target.parentElement?.getAttribute('data-tip'); // used for label elements
      if (!tip) {
        return;
      }
    }

    on_tip_element(target, tip);
  });
};

/* INFO: Help modal */
const modal_box = get_element<HTMLDivElement>('#help-modal');
const modal_close = get_element<HTMLDivElement>('#help-close-btn');
const modal_content = get_element('#help-content');
const question_button = get_element<HTMLButtonElement>('#help-btn');

const show_tip_button = get_element('#help-show-tip-btn');
const show_tutorial_button = get_element('#help-show-tutorial-btn');

const click_handler = (event: PointerEvent) => {
  event.preventDefault();
  let target = event.target;
  if (!target || !(target instanceof HTMLElement)) {
    console.debug("dropping because not an HTML Element");
    return;
  }
  let tip;
  tip = target.getAttribute('data-tip');
  if (!tip) {
    tip = target.parentElement?.getAttribute('data-tip'); // used for label elements
    if (!tip) {
      modal_content.innerText = "There is no tip available for that element. Try again or click on another element";
      return;
    }
  }
  modal_content.innerText = "Tip: " + tip;
};

const show_tip_handler = () => {
  modal_content.innerText = "Now click on the element, whose tip you want to see."

  // click debounce
  setTimeout(() => {
    document.addEventListener('click', click_handler);
  }, 250);
}

const toggle_modal = () => {
  if (modal_box.classList.contains('shown')) {
    // remove listeners
    console.debug("removing listeners");
    document.removeEventListener('click', click_handler);
  } else {
    // restore original state
    console.debug("restoring modal");
    modal_content.addEventListener("DOMContentLoaded", () => {
      modal_content.innerHTML = initial_html;
    });
  }
  modal_box.classList.toggle('shown');
}

const initial_html = modal_content.innerHTML;
const init_modal = () => {
  modal_close.addEventListener('click', toggle_modal);
  question_button.addEventListener('click', toggle_modal);

  show_tip_button.addEventListener('click', show_tip_handler);
  show_tutorial_button.addEventListener('click', () => {
    toggle_modal();
    start_tutorial();
  });
}

export const init_help = () => {
  init_tip();
  init_modal();
}
