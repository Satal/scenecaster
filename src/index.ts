// Public API exports
export { parseScriptFile, parseScriptString, validateScriptFile } from "./schema/parser.js";
export { ScriptSchema } from "./schema/script.schema.js";
export { runPipeline, type PipelineOptions } from "./pipeline/index.js";
export { recordBrowserScene, type RecorderOptions } from "./recorder/index.js";
export { renderVideo, type RenderOptions } from "./renderer/render.js";

// Types
export type {
  Script,
  Scene,
  TitleScene,
  BrowserScene,
  Step,
  Brand,
  OutputConfig,
  OutputVariant,
  Caption,
  Meta,
} from "./schema/script.schema.js";

export type {
  ActionTimestamp,
  RecordingResult,
  SceneRenderData,
  CompositionProps,
} from "./pipeline/types.js";
