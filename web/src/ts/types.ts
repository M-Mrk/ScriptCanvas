import { ErrorOutput, GridSettings, LogMessage } from "../../pkg/wasm/core_engine";

export interface AppState {
  output_type: OutputType,
  language: Language,
  hot_reload: boolean,
  disable_tip: boolean,
}

export const OutputType = {
  GRID: "grid",
} as const;
export type OutputType = typeof OutputType[keyof typeof OutputType];

export const Language = {
  RHAI: "rhai",
} as const;
export type Language = typeof Language[keyof typeof Language];

export interface VariableDoc {
  name: string,
  doc: string,
}

export interface OutputDoc {
  name: string,
  summary: string,
  variables: VariableDoc[],
}

export interface FunctionDoc {
  name: string,
  parameters: [string, string][],
  output: string,
  doc: string,
}

export interface Output {
  pipeline(script: string): Promise<ErrorOutput | null>,
  clear(): void,
  init(): void,
  deinit(): void,
  docs: OutputDoc,
};

export type OutputSetting = GridSettings; // Add new settings here
export type OutputOutputs = Uint8ClampedArray; // Add new outputs here

export interface WorkerRequest {
  script: string,
  state: AppState,
  config: OutputSetting,
  id?: string,
};

export const WorkerStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAILURE: 'failure',
} as const;
export type WorkerStatus = typeof WorkerStatus[keyof typeof WorkerStatus];

interface WorkerSuccess {
  status: typeof WorkerStatus.SUCCESS,
  data: OutputOutputs,
  logs: LogMessage[],
  id: string,
}

// Used for user errors, like bad syntax in script
interface WorkerError {
  status: typeof WorkerStatus.ERROR,
  error: ErrorOutput,
  id: string,
}

// Used for unexpected errors
interface WorkerFailure {
  status: typeof WorkerStatus.FAILURE,
  error: string,
  id: string,
}

export type WorkerResponse = WorkerSuccess | WorkerError | WorkerFailure;
