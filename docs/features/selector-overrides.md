# Selector Overrides

When your responsive layout uses different elements for different screen sizes, selector overrides let you swap CSS selectors per output variant. The desktop variant uses the original selector; other variants use the override.

## Usage

```yaml
- type: browser
  id: demo
  url: "https://example.com"
  steps:
    - action: click
      selector: "button.desktop-nav-toggle"
      duration: 2
  selectorOverrides:
    mobile:
      "button.desktop-nav-toggle": ".mobile-hamburger-menu"
```

## How It Works

1. You write your steps using the desktop (default) selectors
2. In `selectorOverrides`, you map variant IDs to selector replacements
3. When rendering the `mobile` variant, SceneCaster automatically swaps `"button.desktop-nav-toggle"` for `".mobile-hamburger-menu"` before Playwright executes the step
4. The desktop variant is unaffected

## Fields

`selectorOverrides` is an object on browser scenes:

```yaml
selectorOverrides:
  <variant-id>:
    "<original-selector>": "<replacement-selector>"
```

You can override multiple selectors per variant, and define overrides for multiple variants:

```yaml
selectorOverrides:
  mobile:
    "button.desktop-nav-toggle": ".mobile-hamburger-menu"
    ".desktop-sidebar .settings-link": ".mobile-bottom-nav .settings-icon"
  tablet:
    "button.desktop-nav-toggle": ".tablet-nav-menu"
```

## When to Use

- **Mobile hamburger menus** - Desktop has a nav bar; mobile has a hamburger menu
- **Different form layouts** - Desktop shows all fields; mobile uses an accordion
- **Responsive navigation** - Desktop uses a sidebar; mobile uses a bottom tab bar
- **Platform-specific elements** - Elements that only exist at certain breakpoints

## Example: Full Mobile Override

```yaml
- type: browser
  id: create-project
  url: "https://app.example.com/projects"
  steps:
    - action: click
      selector: ".sidebar-nav a[href='/projects/new']"
      duration: 2
      caption:
        text: "Click 'New Project'"

    - action: fill
      selector: "#project-name"
      value: "Q4 Campaign"
      duration: 2

    - action: click
      selector: "button.desktop-submit"
      duration: 2
      caption:
        text: "Save the project"
  selectorOverrides:
    mobile:
      ".sidebar-nav a[href='/projects/new']": ".mobile-fab-button"
      "button.desktop-submit": "button.mobile-submit"
```

## Tips

- Only override selectors that actually differ between variants
- The original selector in your steps should always be the desktop/default version
- Test both variants with `--variant desktop` and `--variant mobile` to verify overrides work
- If a selector works at all viewport sizes, no override is needed

---

[Back to Index](../INDEX.md) | [Previous: Multi-Format Output](multi-format.md) | [CLI Reference](../cli.md)
