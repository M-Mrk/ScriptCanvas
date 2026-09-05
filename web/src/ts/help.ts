import { get_element } from "./common";

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

export const init_help = () => {
  init_tip();
}
