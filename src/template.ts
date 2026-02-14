/**
 * Generate a starter YAML script template.
 */
export function generateTemplate(name: string): string {
  return `meta:
  title: "${name}"

brand:
  primaryColor: "#1e40af"
  backgroundColor: "#0f172a"
  textColor: "#f8fafc"
  fontFamily: "Inter"

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
    duration: 4
    heading: "${name}"
    subheading: "A step-by-step guide"

  - type: browser
    id: main
    url: "https://example.com"
    steps:
      - action: navigate
        url: "https://example.com"
        duration: 3
        caption:
          text: "Open the website"
          position: bottom
          style: bar
          animation: slideUp

  - type: title
    id: outro
    duration: 3
    heading: "All done!"
    variant: outro
`;
}
