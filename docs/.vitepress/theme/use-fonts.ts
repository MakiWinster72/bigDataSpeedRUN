// Runtime font injector for VitePress theme
// - Imports woff2 files so Vite treats them as assets and emits hashed URLs on build
// - Injects @font-face rules at runtime using the resolved import URLs
// - Adds preload links at runtime (useful for dev and as extra safety for prod)
// Usage: import this file in your theme entry (e.g. in `theme/index.ts`) and call the default export
// or simply import it to run automatically.
//
// Note: importing the .woff2 files requires your bundler config to allow asset imports (Vite does by default).
// If TypeScript complains about importing .woff2, you may need a `declare module '*.woff2';` in your typings.

// Hurmit (code font)
import regularUrl from "./fonts/HurmitNerdFontMono-Regular.woff2";
import boldUrl from "./fonts/HurmitNerdFontMono-Bold.woff2";
// Recursive (variable font) for body text
import recursiveUrl from "./fonts/Recursive.woff2";

function createStyle(css: string) {
  const style = document.createElement("style");
  style.setAttribute("data-hurmit-fonts", "true");
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

function addPreload(url: string) {
  // Avoid adding multiple identical preloads
  if (!url) return;
  if (document.querySelector(`link[data-hurmit-preload][href="${url}"]`))
    return;
  const link = document.createElement("link");
  link.setAttribute("data-hurmit-preload", "true");
  link.rel = "preload";
  link.href = url;
  link.as = "font";
  link.type = "font/woff2";
  // keep crossorigin empty string to allow correct fetching behavior
  // (some browsers treat presence of attribute as needing CORS)
  link.crossOrigin = "";
  document.head.appendChild(link);
}

let injected = false;

/**
 * Inject @font-face definitions and CSS variables to use the Recursive body font
 * and Hurmit for code. Uses imported asset URLs so build emits hashed filenames.
 */
export function injectHurmitFonts() {
  if (typeof document === "undefined") return;
  if (injected) return;
  injected = true;

  // Ensure URLs are present
  const reg = String(regularUrl || "");
  const bold = String(boldUrl || "");
  const rec = String(recursiveUrl || "");

  // Build font-face CSS using the resolved URLs.
  // Keep local() first to prefer system-installed fonts, then our bundled asset URL.
  const css = `
/* Recursive variable font for body text */
@font-face {
  font-family: "Recursive";
  src: local("Recursive"), local("Recursive Variable"), url("${rec}") format("woff2");
  /* allow variable weights */
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Hurmit Nerd (monospace) for code */
@font-face {
  font-family: "HurmitR";
  src: local("HurmitNerdFontMono-Regular"), local("HurmitR"), url("${reg}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "HurmitB";
  src: local("HurmitNerdFontMono-Bold"), local("HurmitB"), url("${bold}") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Override VitePress font variables: body uses Recursive, monospace uses Hurmit */
:root {
  --vp-font-family-base: "Recursive", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --vp-font-family-mono: "HurmitR", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
}
`;

  createStyle(css);

  // Add preload links to help the browser fetch fonts earlier (useful in dev and prod)
  if (rec) addPreload(rec);
  if (reg) addPreload(reg);
  if (bold) addPreload(bold);
}

// Default: run on import in client environments.
// If you prefer manual control, import and call `injectHurmitFonts()` instead of importing this file.
if (typeof window !== "undefined") {
  try {
    injectHurmitFonts();
  } catch (e) {
    // avoid breaking the theme if injection fails
    // keep silent; developer can call injectHurmitFonts() manually for debugging
    // eslint-disable-next-line no-console
    console.warn("[use-fonts] failed to inject Hurmit fonts:", e);
  }
}

export default injectHurmitFonts;
