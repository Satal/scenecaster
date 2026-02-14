import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseScriptFile, validateScriptFile } from "./schema/parser.js";
import { runPipeline } from "./pipeline/index.js";
import { launchPreview } from "./preview.js";
import { createLogger } from "./utils/logger.js";
import { generateTemplate } from "./template.js";

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
  .option("--only <ids...>", "Only render specific scene IDs")
  .option("--no-headless", "Show browser window during recording")
  .option("--no-cache", "Force re-recording (skip cache)")
  .option("--no-thumbnail", "Skip thumbnail generation")
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
        scriptDir: dirname(resolve(scriptPath)),
        variantFilter: opts.variant,
        onlyScenes: opts.only,
        headless: opts.headless,
        tmpDir: opts.tmpDir,
        noCache: opts.cache === false,
        noThumbnail: opts.thumbnail === false,
        verbose: opts.verbose,
        logger,
      });

      console.log("");
      logger.success(`Done! ${outputs.length} file(s) rendered:`);
      outputs.forEach((p) => console.log(`  ${p}`));
    } catch (err) {
      logger.error(
        err instanceof Error ? err.message : String(err)
      );
      process.exit(1);
    }
  });

// ── preview ──

program
  .command("preview")
  .description("Open Remotion Studio for frame-by-frame preview")
  .argument("<script>", "Path to the YAML script file")
  .option("--variant <id>", "Preview a specific variant")
  .action(async (scriptPath: string, opts) => {
    const logger = createLogger(true);

    try {
      logger.info(`Parsing script: ${scriptPath}`);
      const script = parseScriptFile(scriptPath);
      logger.success(
        `Parsed "${script.meta.title}" (${script.scenes.length} scenes)`
      );

      await launchPreview(script, {
        variantFilter: opts.variant,
        scriptDir: dirname(resolve(scriptPath)),
        logger,
      });
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

// ── auth ──

program
  .command("auth")
  .description("Log in to a website and save session for authenticated recording")
  .argument("<url>", "URL to open for login")
  .option("-s, --save <path>", "Path to save storage state JSON", "./auth.json")
  .action(async (url: string, opts) => {
    const logger = createLogger(true);

    try {
      const { chromium } = await import("playwright");

      logger.info(`Opening browser at ${url}`);
      logger.info("Log in manually, then close the browser window when done.");
      console.log("");

      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(url, { waitUntil: "networkidle" });

      // Wait for the user to close the browser or the page
      await new Promise<void>((res) => {
        browser.on("disconnected", () => res());
        page.on("close", () => res());
      });

      // Save storage state before cleanup
      const savePath = resolve(opts.save);
      try {
        await context.storageState({ path: savePath });
      } catch {
        // Context may already be closed if user closed the entire browser
        logger.error("Could not save session - browser was closed before saving.");
        logger.info("Tip: close just the tab (not the entire browser) to trigger save.");
        process.exit(1);
      }

      try { await browser.close(); } catch { /* already closed */ }

      console.log("");
      logger.success(`Session saved to ${savePath}`);
      console.log("");
      console.log("  Add to your script:");
      console.log("  meta:");
      console.log(`    auth:`);
      console.log(`      storageState: ${opts.save}`);
    } catch (err) {
      logger.error(
        err instanceof Error ? err.message : String(err)
      );
      process.exit(1);
    }
  });

program.parse();
