# Recording Cache

SceneCaster caches browser recordings to speed up re-renders. When you change a title card or tweak a caption, only the modified browser scenes get re-recorded.

## How It Works

The cache works by hashing each browser scene's configuration:

- URL
- Steps (actions, selectors, values)
- Viewport dimensions
- CSS (both global and per-scene)
- Authentication state

If the hash matches a previous recording, the cached video file is reused instead of re-recording.

### What triggers a re-record

Any change to a browser scene's configuration invalidates its cache:

- Changing the URL
- Adding, removing, or modifying steps
- Changing the viewport dimensions (e.g. switching variant)
- Modifying `globalCss` or `customCss`
- Changing authentication settings

### What does NOT trigger a re-record

Changes to these elements reuse cached recordings:

- Caption text, style, position, or animation
- Transition type or duration
- Browser frame settings
- Cursor settings
- Title scene content
- Brand settings (colours, fonts, logo)

This means you can iterate on captions, transitions, and branding without waiting for browser recordings.

## Cache Expiry

Cache entries expire after **24 hours** and are automatically pruned on each render. This ensures you don't accumulate stale recordings indefinitely.

## Cache Location

Recordings are stored in a temporary directory. You can control this with the `--tmp-dir` CLI option:

```bash
scenecaster render tutorial.yaml --tmp-dir ./cache
```

## Forcing a Fresh Recording

To skip the cache and re-record all browser scenes:

```bash
scenecaster render tutorial.yaml --no-cache
```

This is useful when:
- The website's content has changed but the script hasn't
- You suspect a cached recording is corrupted
- You want to ensure everything is freshly recorded before a final render

---

[Back to Index](../INDEX.md) | [Previous: Authenticated Recording](authenticated-recording.md) | [Next: Thumbnails](thumbnails.md)
