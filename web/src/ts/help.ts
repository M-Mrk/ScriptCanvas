import { get_element, html } from "./common";
import { get_output } from "./state";
import { start_tutorial } from "./tutorial";
import { FunctionDoc, VariableDoc } from "./types";

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
};

const generate_summary_doc_element = (summary: string): HTMLSpanElement => {
  const container = document.createElement('span');
  container.className = "help-summary"
  container.innerText = summary;
  return container;
};

const generate_var_doc_element = (var_doc: VariableDoc): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = "help-var-doc";
  const var_html = html`
    <span>${var_doc.name}:</span>
    <span> ${var_doc.doc}</span>
  `
  container.innerHTML = var_html;
  return container;
};

const show_output_docs = () => {
  console.debug("Showing docs")
  const output_docs = get_output().docs;
  get_element('#help-divider-output-name').innerText = output_docs.name;
  const output_section = get_element('#help-sect-output');
  output_section.innerHTML = "";

  const summary = generate_summary_doc_element(output_docs.summary);
  output_section.appendChild(summary);
  for (const variable of output_docs.variables) {
    const var_doc = generate_var_doc_element(variable);
    output_section.appendChild(var_doc);
  }
};

const generate_function_doc_element = (fdoc: FunctionDoc): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = "help-function-doc";
  let parameters = ""
  for (let i = 0; i < fdoc.parameters.length; i++) {
    const parameter = fdoc.parameters[i];
    if (parameter?.length != 2) {
      throw new Error("FunctionDoc parameter does not have a name and type");
    }
    parameters += `${parameter[0]}<i class="help-function-type">: ${parameter[1]}</i>`;
    if (i = fdoc.parameters.length - 1) {
      // Add space and comma if not the last entry
      parameters += ", ";
    }
  }
  const signature = html`<span class="help-function-signature">${fdoc.name}(${parameters})<i class="help-function-type">: ${fdoc.output}</i>  </span>`
  const summary = html`<span class="help-function-doc">${fdoc.doc}</span>`;
  container.innerHTML = signature + summary;
  return container;
}

const show_language_docs = () => {
  get_element("#help-divider-language-name").innerText = "Rhai";
  const language_section = get_element("#help-sect-language");
  const doc_container = document.createElement("div");
  doc_container.className = "help-function-docs";

  const disclaimer = document.createElement('div');
  disclaimer.innerText = "Here listed are only extra functions, built-in functions and those of the math and sci package are also supported. Do note that some functions only take in floats and might not be recognized if used with integers  (e.g. sin(12) does not work while sin(12.0) does).";
  disclaimer.className = "help-summary";

  const rhai_docs: FunctionDoc[] = [
    {
      name: "rand",
      parameters: [["minimum", "i64"], ["maximum", "i64"]],
      output: "i64",
      doc: "Returns a random number between the minimum and maximum"
    }, {
      name: "rand",
      parameters: [["minimum", "i64"], ["maximum", "i64"]],
      output: "i64",
      doc: "Returns a random number between the minimum and maximum"
    }
  ]
  let html_docs = [];
  for (let fdoc of rhai_docs) {
    html_docs.push(generate_function_doc_element(fdoc))
  }
  doc_container.append(...html_docs);

  language_section.innerHTML = "";
  language_section.appendChild(disclaimer);
  language_section.appendChild(doc_container);
};

const show_docs = () => {
  show_output_docs();
  show_language_docs();
};

const toggle_modal = () => {
  if (modal_box.classList.contains('shown')) {
    // remove listeners
    console.debug("removing listeners");
    document.removeEventListener('click', click_handler);
  } else {
    // restore original state
    console.debug("restoring modal");
    // modal_content.append(...initial_html);
    show_docs();
  }
  modal_box.classList.toggle('shown');
};

const initial_html = modal_content.children;
const init_modal = () => {
  modal_close.addEventListener('click', toggle_modal);
  question_button.addEventListener('click', toggle_modal);

  show_tip_button.addEventListener('click', show_tip_handler);
  show_tutorial_button.addEventListener('click', () => {
    toggle_modal();
    start_tutorial();
  });

  const actions_divider = get_element('#help-divider-actions');
  actions_divider.addEventListener('click', () => {
    toggle_help_section('#help-divider-actions', '#help-sect-actions');
  });

  const output_divider = get_element('#help-divider-output');
  output_divider.addEventListener('click', () => {
    toggle_help_section('#help-divider-output', '#help-sect-output');
  });

  const language_divider = get_element('#help-divider-language');
  language_divider.addEventListener('click', () => {
    toggle_help_section('#help-divider-language', '#help-sect-language');
  });
};

const toggle_help_section = (divider_query: string, section_query: string) => {
  console.debug("toggling section");
  const divider = get_element(divider_query);
  const section = get_element(section_query);

  divider.classList.toggle("toggled");
  section.classList.toggle("shown");
};

export const init_help = () => {
  init_tip();
  init_modal();
};
