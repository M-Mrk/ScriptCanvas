import { throttle, get_element, debounce } from "./common";

import * as Monaco from "monaco-editor";
import { run_pipeline } from "./interaction";
import { get_state } from "./state";
declare const require: any;
declare const monaco: typeof Monaco;
// Be careful to use monaco (lower case) when necessary in order not to import unnecessary files

let editor_global: Monaco.editor.IStandaloneCodeEditor | undefined;

const editor_container = get_element<HTMLDivElement>('#editor-container');

export const get_editor = (): Monaco.editor.IStandaloneCodeEditor => {
  if (!editor_global) {
    throw new Error("editor not initialized yet.");
  }
  return editor_global;
};

const throttled_backup = throttle(() => {
  const editor = get_editor();
  console.log("Backing up script");
  window.localStorage.setItem("script", editor.getValue());
}, 500);

const debounced_hot_reload = debounce(() => {
  console.log("Hot reloading");
  run_pipeline();
}, 1000);

const content_changed = () => {
  if (!editor_global) {
    console.warn("editor not initialized yet.")
    return;
  }
  throttled_backup();

  const state = get_state();
  if (state.hot_reload) {
    debounced_hot_reload();
  }
};

const resizing_observer = new ResizeObserver(() => {
  const editor = get_editor();
  editor.layout();
});

export const init_editor = () => {
  let last_script = window.localStorage.getItem("script");
  if (!last_script) {
    last_script = [
      '// Write your Rhai script here',
      '// It will run on every pixel and the return will define the pixels color',
      '// Return an array of RGB values, e.g. [ 255, 125, 50 ]',
      '//',
      '// You also have access to the current pixels coordinates: x, y',
      '//',
      '// Use any built-in rhai function and some extra ones, like:',
      '// rand(min: i64, max: i64) -> i64 Returns a random number in the given range',
      'return [ x*10, x*y, y*10 ];',
    ].join('\n');
  }

  require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
  require(['vs/editor/editor.main'], function() {
    editor_global = monaco.editor.create(editor_container, {
      value: last_script,
      language: 'rust', // Rhai doesn't have a built-in syntax, but 'rust' looks very close!
      automaticLayout: true,
      theme: 'vs-dark',
      minimap: {
        enabled: false, // Not really neeeded for short scripts and creates visual bugs
      }
    });

    editor_global.onDidChangeModelContent(content_changed);
    resizing_observer.observe(document.documentElement);
    editor_global.layout();
  });
}

let highlights_collection: Monaco.editor.IEditorDecorationsCollection | undefined;
const get_highlight_collection = (): Monaco.editor.IEditorDecorationsCollection => {
  if (highlights_collection) {
    return highlights_collection;
  }
  const editor = get_editor();
  highlights_collection = editor?.createDecorationsCollection();
  return highlights_collection as Monaco.editor.IEditorDecorationsCollection;
}

export const highlight_clear = () => {
  const collection = get_highlight_collection();
  collection?.clear();
}

export const highlight_line = (line: number) => {
  highlight_clear();
  const collection = get_highlight_collection();
  collection.set([
    {
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: "editor-error-line",
      }
    }
  ]);
  const editor = get_editor();
  editor.revealLineInCenterIfOutsideViewport(line);
}
