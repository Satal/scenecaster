# Script Reference: `brand`

The `brand` section defines your visual identity. These settings are applied to title cards, caption overlays, and other branded elements throughout the video.

## Example

```yaml
brand:
  logo: "./assets/logo.png"
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Poppins"
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `logo` | string | No | - | Path to your logo image. Shown on title and outro cards. Resolved relative to the script file. |
| `primaryColor` | string | No | `"#3b82f6"` | Accent colour used in captions, highlights, progress bars, and title card accents. |
| `backgroundColor` | string | No | `"#0f172a"` | Background colour for title cards. |
| `textColor` | string | No | `"#f8fafc"` | Text colour for title card headings and subheadings. |
| `fontFamily` | string | No | `"Inter"` | Google Font name. Loaded automatically during rendering. |

All fields have sensible defaults. You can omit the entire `brand` section if you're happy with the built-in dark theme.

## Logo

The logo is displayed on `main` and `outro` title card variants. It's typically your company or product logo.

```yaml
brand:
  logo: "./assets/logo.png"
```

Supported formats: PNG, JPG, SVG. The path is resolved relative to the script file.

## Colours

Colours are specified as hex strings. They control different parts of the video:

```yaml
brand:
  primaryColor: "#1e40af"      # Blue accent
  backgroundColor: "#0f172a"   # Dark navy background
  textColor: "#f8fafc"         # Near-white text
```

- **`primaryColor`** - The accent colour. Used for caption bar backgrounds, highlight rings on clicks, the accent line on title cards, and progress indicators.
- **`backgroundColor`** - The solid background colour for all title card scenes.
- **`textColor`** - The text colour for headings and subheadings on title cards.

### Colour Examples

**Dark corporate:**
```yaml
primaryColor: "#1e40af"
backgroundColor: "#0f172a"
textColor: "#f8fafc"
```

**Light and clean:**
```yaml
primaryColor: "#059669"
backgroundColor: "#ffffff"
textColor: "#1f2937"
```

**Bold and vibrant:**
```yaml
primaryColor: "#e11d48"
backgroundColor: "#18181b"
textColor: "#fafafa"
```

## Fonts

The `fontFamily` field accepts any [Google Fonts](https://fonts.google.com/) family name. SceneCaster loads the font automatically during rendering.

```yaml
brand:
  fontFamily: "Poppins"
```

If the font doesn't exist on Google Fonts, SceneCaster falls back gracefully with a warning and uses the system default sans-serif font.

Popular choices:
- `"Inter"` - Clean and modern (default)
- `"Poppins"` - Geometric and friendly
- `"Plus Jakarta Sans"` - Contemporary and professional
- `"DM Sans"` - Slightly rounded, approachable
- `"Space Grotesk"` - Technical and distinctive

---

[Back to Index](../INDEX.md) | [Previous: `meta`](meta.md) | [Next: `output`](output.md)
