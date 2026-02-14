# Error Messages

When something goes wrong, SceneCaster provides actionable error messages instead of raw stack traces. Here are the common errors and how to fix them.

## Recording Errors

### Element not found

```
✖ Could not find element in scene "fill-details", step 2.
  Page URL: https://demo.example.com/app/team-members/create
  Suggestions:
    - Add a "waitFor" field to wait for the element to appear
    - Check that the selector matches an element on the page
    - Try running with --no-headless to see the browser
```

**Cause:** Playwright couldn't find the element matching the step's `selector`.

**Fixes:**
- Add `waitFor` to the step (or a previous step) to wait for the element to appear
- Verify the selector is correct by inspecting the page in your browser's dev tools
- Run with `--no-headless` to watch the browser and see what's on screen
- Check if the element is inside an iframe (Playwright selectors don't cross iframe boundaries by default)

### Navigation timeout

```
✖ Navigation timed out in scene "dashboard", step 1.
  URL: https://app.example.com/dashboard
  Suggestions:
    - Check that the URL is accessible
    - Increase the waitFor timeout
    - Check your auth.json if the page requires login
```

**Cause:** The page didn't finish loading within the timeout.

**Fixes:**
- Verify the URL is accessible in a regular browser
- If the page requires authentication, check your `auth.json` is valid (see [Authenticated Recording](features/authenticated-recording.md))
- Increase the `waitFor.timeout` value

### Authentication expired

```
✖ Page redirected to login in scene "dashboard".
  Expected URL: https://app.example.com/dashboard
  Actual URL: https://app.example.com/login
  Suggestions:
    - Re-run "scenecaster auth" to save a fresh session
```

**Cause:** The saved session has expired and the page redirected to login.

**Fix:** Re-run `scenecaster auth` to save a fresh session.

## Validation Errors

### Invalid YAML syntax

```
✖ Invalid YAML in tutorial.yaml
  Line 15: bad indentation of a mapping entry
```

**Cause:** YAML syntax error.

**Fix:** Check the indentation at the reported line. YAML requires consistent spaces (not tabs).

### Missing required fields

```
✖ Validation failed for tutorial.yaml
  - scenes[1].url: Required
  - scenes[1].steps: Required
```

**Cause:** A required field is missing from the script.

**Fix:** Add the missing fields. See the [Script Reference](script-reference/meta.md) for all required fields.

### Invalid field values

```
✖ Validation failed for tutorial.yaml
  - output.fps: Number must be greater than 0
  - scenes[0].duration: Number must be greater than 0
```

**Cause:** A field has an invalid value.

**Fix:** Correct the value according to the field's type and constraints.

## Rendering Errors

### Chromium not installed

```
✖ Chromium browser not found.
  Run: npx playwright install chromium
```

**Fix:** Run the command shown to install Chromium.

### FFmpeg not found

```
✖ FFmpeg not found. Remotion requires FFmpeg for rendering.
```

**Fix:** Install FFmpeg:
- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`
- Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Output directory not writable

```
✖ Cannot write to output directory: ./videos
  Check that the directory exists and you have write permissions.
```

**Fix:** Create the directory or check permissions.

## Debugging Tips

1. **Run with `--no-headless`** to watch the browser and see what Playwright sees
2. **Run with `-v` (verbose)** for detailed logs including timing and Remotion output
3. **Use `scenecaster validate`** first to catch script errors before recording
4. **Use `--only <scene-id>`** to isolate and debug a specific scene
5. **Check the URL** in a regular browser to ensure it loads correctly

---

[Back to Index](INDEX.md) | [Examples](examples.md) | [CLI Reference](cli.md)
