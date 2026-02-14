# Script Reference: `meta`

The `meta` section contains video metadata and global settings.

## Example

```yaml
meta:
  title: "How to Create an Invoice"
  globalCss: |
    .cookie-banner { display: none !important; }
  auth:
    storageState: ./auth.json
```

## Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | - | Video title. Used in output filenames. |
| `globalCss` | string | No | - | CSS injected into every browser scene. Re-injected on each navigation. |
| `auth` | object | No | - | Authentication configuration for recording behind login walls. |
| `auth.storageState` | string | No | - | Path to a Playwright storage state JSON file. Resolved relative to the script file. |

## `title`

The title is used to generate output filenames. For example, a title of `"How to Add a Team Member"` with a `desktop` variant produces:

```
how-to-add-a-team-member-desktop.mp4
```

## `globalCss`

CSS that gets injected into every browser scene's page. This is useful for hiding elements that shouldn't appear in any scene:

```yaml
meta:
  globalCss: |
    .cookie-banner { display: none !important; }
    .chat-widget { display: none !important; }
    .announcement-bar { display: none !important; }
```

The CSS is re-injected after each navigation, so it persists across page loads within a scene.

For per-scene CSS, use the `customCss` field on individual browser scenes instead. See [CSS Injection](../features/css-injection.md) for full details.

## `auth`

Lets you record pages that require login without showing the login process in the video. SceneCaster uses Playwright's storage state to restore cookies and localStorage from a previously saved session.

```yaml
meta:
  auth:
    storageState: ./auth.json
```

The `storageState` path is resolved relative to the script file location.

See [Authenticated Recording](../features/authenticated-recording.md) for the full workflow including how to save your session.

---

[Back to Index](../INDEX.md) | [Next: `brand`](brand.md)
