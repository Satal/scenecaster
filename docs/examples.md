# Examples

Real-world SceneCaster scripts for common use cases.

## SaaS Onboarding Tutorial

A multi-scene tutorial showing how to add a team member, with desktop and mobile variants, branding, and captions.

```yaml
meta:
  title: "How to Add a Team Member"
  globalCss: |
    .cookie-banner { display: none !important; }

brand:
  logo: "./assets/logo.png"
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Inter"

output:
  fps: 30
  transition:
    type: fade
    duration: 0.5
  thumbnail:
    enabled: true
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"
    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport: { width: 390, height: 693 }

scenes:
  - type: title
    id: intro
    duration: 4
    heading: "Adding Team Members"
    subheading: "A step-by-step guide"
    transition:
      type: zoom
      duration: 0.6

  - type: browser
    id: navigate-to-team
    url: "https://demo.example.com/app/team-members"
    frame:
      style: macos
      showUrl: true
    cursor:
      enabled: true
      style: pointer
    steps:
      - action: navigate
        url: "https://demo.example.com/app/team-members"
        duration: 3
        waitFor: ".team-members-table"
        caption:
          text: "Navigate to Team Members"
          position: bottom
          style: bar
          animation: slideUp

      - action: click
        selector: "a[href*='team-members/create']"
        highlight: true
        duration: 2
        caption:
          text: "Click 'New team member' to get started"

  - type: browser
    id: fill-details
    url: "https://demo.example.com/app/team-members/create"
    frame:
      style: minimal
      darkMode: true
    cursor:
      enabled: true
    steps:
      - action: fill
        selector: "input[name='name']"
        value: "Jane Smith"
        typeSpeed: 80
        duration: 2
        caption:
          text: "Enter the team member's name"
          animation: fadeIn

      - action: fill
        selector: "input[name='role']"
        value: "Senior Developer"
        typeSpeed: 80
        duration: 2

      - action: scroll
        y: 300
        smooth: true
        duration: 1

      - action: click
        selector: "button[type='submit']"
        highlight: true
        duration: 3
        caption:
          text: "Save the new team member"
    transition:
      type: slide
      direction: left
      duration: 0.4

  - type: title
    id: outro
    duration: 4
    heading: "You're all set!"
    subheading: "Your team member has been added"
    variant: outro
```

## Simple Product Demo

A minimal script for a quick product walkthrough with no authentication.

```yaml
meta:
  title: "Product Overview"

brand:
  primaryColor: "#059669"
  backgroundColor: "#ffffff"
  textColor: "#1f2937"
  fontFamily: "Plus Jakarta Sans"

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
    duration: 3
    heading: "Welcome to Acme"
    variant: minimal

  - type: browser
    id: homepage
    url: "https://acme.example.com"
    frame:
      style: macos
      showUrl: true
    steps:
      - action: navigate
        url: "https://acme.example.com"
        duration: 4
        caption:
          text: "This is the Acme homepage"
          style: subtitle

      - action: scroll
        y: 600
        smooth: true
        duration: 3
        caption:
          text: "Scroll down to see features"
          style: subtitle

      - action: click
        selector: "a[href='/pricing']"
        highlight: true
        duration: 3
        caption:
          text: "Check out our pricing"
```

## Authenticated Dashboard Tutorial

Recording behind a login wall with session storage.

```yaml
meta:
  title: "Dashboard Overview"
  auth:
    storageState: ./auth.json
  globalCss: |
    .intercom-launcher { display: none !important; }
    .announcement-bar { display: none !important; }

brand:
  logo: "./assets/logo.png"
  primaryColor: "#7c3aed"
  backgroundColor: "#1e1b4b"
  textColor: "#e0e7ff"
  fontFamily: "DM Sans"

output:
  fps: 30
  transition:
    type: fade
    duration: 0.4
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"

scenes:
  - type: title
    id: intro
    duration: 3
    heading: "Your Dashboard"
    subheading: "Key metrics at a glance"
    transition:
      type: zoom
      duration: 0.5

  - type: browser
    id: dashboard
    url: "https://app.example.com/dashboard"
    frame:
      style: macos
      showUrl: true
    cursor:
      enabled: true
    steps:
      - action: navigate
        url: "https://app.example.com/dashboard"
        duration: 4
        waitFor: ".dashboard-widgets"
        caption:
          text: "Your dashboard shows key metrics"
          style: bar

      - action: click
        selector: ".widget-revenue"
        highlight: true
        duration: 3
        caption:
          text: "Click any widget for details"
          style: bubble

      - action: scroll
        y: 500
        smooth: true
        duration: 2

      - action: wait
        timeout: 1000
        duration: 2
        caption:
          text: "Recent activity is shown below"
          style: subtitle
          animation: typewriter
```

## Multi-Platform Output

A script that produces desktop, mobile, and square variants with selector overrides.

```yaml
meta:
  title: "Creating a Project"

brand:
  primaryColor: "#e11d48"
  fontFamily: "Space Grotesk"

output:
  fps: 30
  variants:
    - id: desktop
      width: 1920
      height: 1080
      aspectRatio: "16:9"
    - id: mobile
      width: 1080
      height: 1920
      aspectRatio: "9:16"
      viewport: { width: 390, height: 693 }
    - id: square
      width: 1080
      height: 1080
      aspectRatio: "1:1"
      viewport: { width: 540, height: 540 }

scenes:
  - type: title
    id: intro
    duration: 3
    heading: "New Project"

  - type: browser
    id: create
    url: "https://app.example.com/projects/new"
    frame:
      style: macos
    cursor:
      enabled: true
    steps:
      - action: click
        selector: ".sidebar-nav a[href='/projects/new']"
        duration: 2
        caption:
          text: "Start a new project"

      - action: fill
        selector: "#project-name"
        value: "Q4 Campaign"
        typeSpeed: 60
        duration: 2

      - action: click
        selector: "button[type='submit']"
        highlight: true
        duration: 3
        caption:
          text: "Save your project"
    selectorOverrides:
      mobile:
        ".sidebar-nav a[href='/projects/new']": ".mobile-fab-button"
      square:
        ".sidebar-nav a[href='/projects/new']": ".mobile-fab-button"
```

---

[Back to Index](INDEX.md) | [CLI Reference](cli.md) | [Error Messages](error-messages.md)
