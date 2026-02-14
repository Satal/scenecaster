import React, { useCallback, useEffect, useState } from "react";
import {
  delayRender,
  continueRender,
} from "remotion";

export interface FontLoaderProps {
  fontFamily: string;
  weights?: number[];
  children: React.ReactNode;
}

/**
 * Load a Google Font and delay rendering until it's available.
 * Falls back gracefully if the font can't be loaded.
 */
export const FontLoader: React.FC<FontLoaderProps> = ({
  fontFamily,
  weights = [400, 500, 600, 700],
  children,
}) => {
  const [handle] = useState(() =>
    delayRender(`Loading font "${fontFamily}"`)
  );

  const loadFont = useCallback(async () => {
    try {
      const weightParam = "wght@" + weights.join(";");
      const encoded = encodeURIComponent(fontFamily);
      const url = `https://fonts.googleapis.com/css2?family=${encoded}:${weightParam}&display=swap`;

      // Inject the font stylesheet
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);

      // Wait for the font to be ready
      await document.fonts.ready;

      continueRender(handle);
    } catch {
      // Font load failed - continue with fallback
      console.warn(
        `Could not load Google Font "${fontFamily}". Falling back to system fonts.`
      );
      continueRender(handle);
    }
  }, [fontFamily, weights, handle]);

  useEffect(() => {
    loadFont();
  }, [loadFont]);

  return <>{children}</>;
};
