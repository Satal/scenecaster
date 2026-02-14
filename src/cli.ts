import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseScriptFile, validateScriptFile } from "./schema/parser.js";
import { runPipeline } from "./pipeline/index.js";
import { createLogger } from "./utils/logger.js";

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
let version = "0.1.0";
try {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "../package.json"), "utf-8")
  );
  version = pkg.version;
} catch {
  // Use default version
}

const program = new Command();

program
  .name("scenecaster")
  .description(
    "Generate professional tutorial videos from YAML scripts"
  )
  .version(version);

// ── render ──

program
  .command("render")
  .description("Render a tutorial video from a script file")
  .argument("<script>", "Path to the YAML script file")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option("--variant <id>", "Only render a specific variant")
  .option("--no-headless", "Show browser window during recording")
  .option("--tmp-dir <dir>", "Temporary directory for recordings")
  .option("-v, --verbose", "Show detailed progress", false)
  .action(async (scriptPath: string, opts) => {
    const logger = createLogger(opts.verbose);

    try {
      logger.info(`Parsing script: ${scriptPath}`);
      const script = parseScriptFile(scriptPath);
      logger.success(
        `Parsed "${script.meta.title}" (${script.scenes.length} scenes)`
      );

      const outputs = await runPipeline(script, {
        outputDir: opts.output,
        variantFilter: opts.variant,
        headless: opts.headless,
        tmpDir: opts.tmpDir,
        logger,
      });

      console.log("");
      logger.success(`Done! ${outputs.length} video(s) rendered:`);
      outputs.forEach((p) => console.log(`  ${p}`));
    } catch (err) {
      logger.error(
        err instanceof Error ? err.message : String(err)
      );
      process.exit(1);
    }
  });

// ── validate ──

program
  .command("validate")
  .description("Validate a script file without rendering")
  .argument("<script>", "Path to the YAML script file")
  .action((scriptPath: string) => {
    const logger = createLogger(true);
    const result = validateScriptFile(scriptPath);

    if (result.valid) {
      const script = parseScriptFile(scriptPath);
      logger.success(`Valid script: "${script.meta.title}"`);
      console.log(`  Scenes: ${script.scenes.length}`);
      console.log(`  Variants: ${script.output.variants.map((v) => v.id).join(", ")}`);
      console.log(`  FPS: ${script.output.fps}`);
    } else {
      logger.error("Script validation failed:");
      result.errors?.forEach((e) => console.log(`  - ${e}`));
      process.exit(1);
    }
  });

// ── init ──

program
  .command("init")
  .description("Create a starter script template")
  .option("-n, --name <name>", "Project name", "my-tutorial")
  .action((opts) => {
    const logger = createLogger(true);
    const template = generateTemplate(opts.name);
    const filename = `${opts.name}.scenecaster.yaml`;

    writeFileSync(filename, template);
    logger.success(`Created ${filename}`);
    console.log(`  Edit the file, then run: scenecaster render ${filename}`);
  });

program.parse();

function generateTemplate(name: string): string {
  return `meta:
  title: "${name}"

brand:
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Inter"

output:
  fps: 30
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"

scenes:
  - type: title
    id: intro
    duration: 4
    heading: "${name}"
    subheading: "A step-by-step guide"

  - type: browser
    id: main
    url: "https://example.com"
    steps:
      - action: navigate
        url: "https://example.com"
        duration: 3
        caption:
          text: "Open the website"
          position: bottom
          style: bar
          animation: slideUp

  - type: title
    id: outro
    duration: 3
    heading: "All done!"
    variant: outro
`;
}
