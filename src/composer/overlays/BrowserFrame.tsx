import React from "react";
import type { FrameConfig } from "../../schema/script.schema.js";

export interface BrowserFrameProps {
  config: FrameConfig;
  url?: string;
  width: number;
  height: number;
  children: React.ReactNode;
}

const TITLE_BAR_HEIGHT = 44;
const URL_BAR_HEIGHT = 36;

/**
 * macOS-style browser chrome frame that wraps recorded browser video.
 */
export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  config,
  url,
  width,
  height,
  children,
}) => {
  if (config.style === "none" || height > width) {
    return <>{children}</>;
  }

  const showUrlBar = config.showUrl && url && config.style === "macos";
  const chromeHeight = TITLE_BAR_HEIGHT + (showUrlBar ? URL_BAR_HEIGHT : 0);
  const contentHeight = height - chromeHeight;

  const bgColor = config.darkMode ? "#1e1e1e" : "#e8e8e8";
  const borderColor = config.darkMode ? "#333333" : "#cccccc";
  const textColor = config.darkMode ? "#cccccc" : "#666666";
  const urlBgColor = config.darkMode ? "#2d2d2d" : "#ffffff";

  return (
    <div
      style={{
        width,
        height,
        borderRadius: config.style === "macos" ? 10 : 6,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          width,
          height: TITLE_BAR_HEIGHT,
          backgroundColor: bgColor,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          flexShrink: 0,
        }}
      >
        {/* Traffic light dots */}
        <div style={{ display: "flex", gap: 8 }}>
          <TrafficDot color="#ff5f57" />
          <TrafficDot color="#febc2e" />
          <TrafficDot color="#28c840" />
        </div>
      </div>

      {/* URL bar (macos style only) */}
      {showUrlBar && (
        <div
          style={{
            width,
            height: URL_BAR_HEIGHT,
            backgroundColor: bgColor,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 16,
            paddingRight: 16,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              backgroundColor: urlBgColor,
              borderRadius: 8,
              padding: "6px 20px",
              fontSize: 15,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: textColor,
              width: "50%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "center",
              border: `1px solid ${borderColor}`,
            }}
          >
            {url}
          </div>
        </div>
      )}

      {/* Video content - fills width, crops bottom if needed */}
      <div
        style={{
          width,
          height: contentHeight,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const TrafficDot: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: color,
    }}
  />
);
