# Authenticated Recording

Record pages behind login walls without showing the login process in the video. SceneCaster uses Playwright's [storage state](https://playwright.dev/docs/auth) to restore cookies and localStorage from a previously saved session.

## Workflow

### Step 1: Save your session

```bash
scenecaster auth https://app.example.com/login --save ./auth.json
```

A visible browser window opens at the URL. Log in manually using whatever method your app supports (username/password, SSO, OAuth, magic links). When you're done, close the tab. SceneCaster saves your cookies and localStorage to the JSON file.

### Step 2: Reference it in your script

```yaml
meta:
  title: "Dashboard Tutorial"
  auth:
    storageState: ./auth.json
```

That's it. Every browser scene now opens with your session already active - no login screen in the video.

## How It Works

When `meta.auth.storageState` is set:

1. SceneCaster reads the JSON file containing cookies and localStorage data
2. Before launching each browser scene, Playwright creates a new browser context with the saved state
3. The browser behaves as if you're already logged in - session cookies, auth tokens, and localStorage values are all present
4. The login process never appears in the recording

## CLI Reference

```bash
scenecaster auth <url> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --save <path>` | Where to save the storage state JSON | `./auth.json` |

The `<url>` should be your login page or the page where authentication starts. The browser opens visibly (not headless) so you can interact with it.

## Tips

- The `storageState` path is resolved relative to the script file location
- Re-run `scenecaster auth` when your session expires
- Don't commit `auth.json` to version control - add it to `.gitignore`
- Works with any authentication method: username/password, SSO, OAuth, magic links, 2FA
- If your session has a short expiry, record the auth state just before rendering

## Troubleshooting

**Session expired during recording:**
Re-run `scenecaster auth` to save a fresh session, then re-render.

**Pages still show login screen:**
Check that the `storageState` path is correct and the file exists. The path is relative to the script file, not the current working directory.

**Different domains need different sessions:**
If your app uses multiple domains (e.g. `auth.example.com` and `app.example.com`), make sure you complete the full login flow so cookies for all domains are captured.

---

[Back to Index](../INDEX.md) | [Previous: CSS Injection](css-injection.md) | [Next: Recording Cache](recording-cache.md)
