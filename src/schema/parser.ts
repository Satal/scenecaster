import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { ZodError } from "zod";
import { ScriptSchema, type Script } from "./script.schema.js";

export class ScriptParseError extends Error {
  constructor(
    message: string,
    public readonly issues?: ZodError["issues"]
  ) {
    super(message);
    this.name = "ScriptParseError";
  }
}

/**
 * Parse a YAML or JSON script file and validate against the schema.
 */
export function parseScriptFile(filePath: string): Script {
  const absolutePath = resolve(filePath);
  let raw: string;

  try {
    raw = readFileSync(absolutePath, "utf-8");
  } catch {
    throw new ScriptParseError(`Cannot read file: ${absolutePath}`);
  }

  return parseScriptString(raw, absolutePath);
}

/**
 * Parse a YAML or JSON string and validate against the schema.
 */
export function parseScriptString(
  content: string,
  sourcePath?: string
): Script {
  let data: unknown;

  try {
    data = parseYaml(content);
  } catch {
    throw new ScriptParseError(
      `Invalid YAML${sourcePath ? ` in ${sourcePath}` : ""}`
    );
  }

  if (data === null || data === undefined) {
    throw new ScriptParseError("Script file is empty");
  }

  const result = ScriptSchema.safeParse(data);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new ScriptParseError(
      `Script validation failed:\n${messages}`,
      result.error.issues
    );
  }

  return result.data;
}

/**
 * Validate a script file without returning the parsed result.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 */
export function validateScriptFile(filePath: string): {
  valid: boolean;
  errors?: string[];
} {
  try {
    parseScriptFile(filePath);
    return { valid: true };
  } catch (err) {
    if (err instanceof ScriptParseError) {
      return {
        valid: false,
        errors: err.issues
          ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
          : [err.message],
      };
    }
    throw err;
  }
}
