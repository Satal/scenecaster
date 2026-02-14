# CSS Injection

Inject CSS to hide or modify elements that shouldn't appear in the video. SceneCaster supports both global CSS (applied to every browser scene) and per-scene CSS.

## Global CSS

Defined in the `meta` section. Injected into every browser scene and re-injected after each navigation.

```yaml
meta:
  globalCss: |
    .cookie-banner { display: none !important; }
    .chat-widget { display: none !important; }
```

## Per-Scene CSS

Defined on individual browser scenes with `customCss`. Only applies to that scene.

```yaml
- type: browser
  id: demo
  url: "https://example.com"
  customCss: |
    .sidebar { width: 0 !important; }
```

## How It Works

1. When a browser scene starts, SceneCaster injects `globalCss` (if defined) into the page
2. Then it injects `customCss` (if defined) for that specific scene
3. After any `navigate` action within the scene, CSS is re-injected to ensure it persists across page loads
4. CSS is injected via a `<style>` tag appended to the document head

## Common Patterns

### Hide cookie/consent banners

```yaml
meta:
  globalCss: |
    .cookie-banner,
    .cookie-consent,
    [class*="cookie"],
    [id*="cookie-consent"] {
      display: none !important;
    }
```

### Hide chat widgets

```yaml
meta:
  globalCss: |
    .intercom-launcher,
    .crisp-client,
    #hubspot-messages-iframe-container,
    [class*="chat-widget"] {
      display: none !important;
    }
```

### Hide navigation for focused demos

```yaml
- type: browser
  customCss: |
    .sidebar { display: none !important; }
    .top-nav { display: none !important; }
    .main-content { margin-left: 0 !important; }
```

### Hide announcement/notification bars

```yaml
meta:
  globalCss: |
    .announcement-bar,
    .notification-banner,
    .promo-bar {
      display: none !important;
    }
```

### Simplify the UI for clarity

```yaml
- type: browser
  customCss: |
    .advanced-options { display: none !important; }
    .help-tooltips { display: none !important; }
```

## Tips

- Use `!important` to ensure your overrides take effect
- Global CSS is best for elements that appear on every page (cookie banners, chat widgets)
- Per-scene CSS is best for scene-specific layout changes (hiding a sidebar for a focused view)
- Both `globalCss` and `customCss` are applied together when both are present

---

[Back to Index](../INDEX.md) | [Previous: Browser Frame](browser-frame.md) | [Next: Authenticated Recording](authenticated-recording.md)
