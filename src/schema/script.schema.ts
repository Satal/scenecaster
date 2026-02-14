import { z } from "zod";

// ── Caption ──

export const CaptionPositionSchema = z.enum(["top", "bottom", "center"]);
export const CaptionStyleSchema = z.enum(["bar", "bubble", "subtitle", "pill"]);
export const CaptionAnimationSchema = z.enum([
  "slideUp",
  "fadeIn",
  "typewriter",
  "none",
]);

export const CaptionSchema = z.object({
  text: z.string().min(1),
  position: CaptionPositionSchema.default("bottom"),
  style: CaptionStyleSchema.default("bar"),
  animation: CaptionAnimationSchema.default("slideUp"),
});

// ── Actions ──

const BaseStepSchema = z.object({
  duration: z.number().positive().default(2),
  caption: CaptionSchema.optional(),
});

export const NavigateActionSchema = BaseStepSchema.extend({
  action: z.literal("navigate"),
  url: z.string().url(),
});

export const ClickActionSchema = BaseStepSchema.extend({
  action: z.literal("click"),
  selector: z.string().min(1),
  highlight: z.boolean().default(false),
});

export const FillActionSchema = BaseStepSchema.extend({
  action: z.literal("fill"),
  selector: z.string().min(1),
  value: z.string(),
  typeSpeed: z.number().positive().default(80),
});

export const ScrollActionSchema = BaseStepSchema.extend({
  action: z.literal("scroll"),
  selector: z.string().optional(),
  y: z.number().default(0),
  x: z.number().default(0),
  smooth: z.boolean().default(true),
});

export const WaitActionSchema = BaseStepSchema.extend({
  action: z.literal("wait"),
  timeout: z.number().positive().default(1000),
});

export const StepSchema = z.discriminatedUnion("action", [
  NavigateActionSchema,
  ClickActionSchema,
  FillActionSchema,
  ScrollActionSchema,
  WaitActionSchema,
]);

// ── Scenes ──

export const TitleVariantSchema = z.enum([
  "main",
  "chapter",
  "minimal",
  "outro",
]);

export const TitleSceneSchema = z.object({
  type: z.literal("title"),
  id: z.string().min(1),
  duration: z.number().positive().default(4),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  variant: TitleVariantSchema.default("main"),
});

export const SelectorOverridesSchema = z.record(
  z.string(),
  z.record(z.string(), z.string())
);

export const BrowserSceneSchema = z.object({
  type: z.literal("browser"),
  id: z.string().min(1),
  url: z.string().url(),
  steps: z.array(StepSchema).min(1),
  selectorOverrides: SelectorOverridesSchema.optional(),
});

export const SceneSchema = z.discriminatedUnion("type", [
  TitleSceneSchema,
  BrowserSceneSchema,
]);

// ── Output Variants ──

export const ViewportSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const OutputVariantSchema = z.object({
  id: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.string().regex(/^\d+:\d+$/),
  viewport: ViewportSchema.optional(),
});

// ── Brand ──

export const BrandSchema = z.object({
  logo: z.string().optional(),
  primaryColor: z.string().default("#1e40af"),
  backgroundColor: z.string().default("#0f172a"),
  textColor: z.string().default("#f8fafc"),
  fontFamily: z.string().default("Inter"),
});

// ── Output Config ──

export const OutputConfigSchema = z.object({
  fps: z.number().int().positive().default(30),
  variants: z.array(OutputVariantSchema).min(1),
});

// ── Meta ──

export const MetaSchema = z.object({
  title: z.string().min(1),
});

// ── Top-Level Script ──

export const ScriptSchema = z.object({
  meta: MetaSchema,
  brand: BrandSchema.default({}),
  output: OutputConfigSchema.default({
    fps: 30,
    variants: [
      { id: "desktop", width: 1920, height: 1080, aspectRatio: "16:9" },
    ],
  }),
  scenes: z.array(SceneSchema).min(1),
});

// ── Inferred Types ──

export type Caption = z.infer<typeof CaptionSchema>;
export type CaptionPosition = z.infer<typeof CaptionPositionSchema>;
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;
export type CaptionAnimation = z.infer<typeof CaptionAnimationSchema>;

export type NavigateAction = z.infer<typeof NavigateActionSchema>;
export type ClickAction = z.infer<typeof ClickActionSchema>;
export type FillAction = z.infer<typeof FillActionSchema>;
export type ScrollAction = z.infer<typeof ScrollActionSchema>;
export type WaitAction = z.infer<typeof WaitActionSchema>;
export type Step = z.infer<typeof StepSchema>;

export type TitleScene = z.infer<typeof TitleSceneSchema>;
export type BrowserScene = z.infer<typeof BrowserSceneSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type TitleVariant = z.infer<typeof TitleVariantSchema>;

export type OutputVariant = z.infer<typeof OutputVariantSchema>;
export type ViewportConfig = z.infer<typeof ViewportSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type OutputConfig = z.infer<typeof OutputConfigSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type Script = z.infer<typeof ScriptSchema>;
