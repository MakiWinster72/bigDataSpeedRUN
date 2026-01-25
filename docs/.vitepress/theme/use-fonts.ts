// Runtime font injector for VitePress theme
// - Imports woff2 files so Vite treats them as assets and emits hashed URLs on build
// - Injects @font-face rules at runtime using the resolved import URLs
// - Adds preload links at runtime (useful for dev and as extra safety for prod)
// Usage: import this file in your theme entry (e.g. in `theme/index.ts`) and call the default export
// or simply import it to run automatically.
//
// Note: importing the .woff2 files requires your bundler config to allow asset imports (Vite does by default).
// If TypeScript complains about importing .woff2, you may need a `declare module '*.woff2';` in your typings.

// HM-M (body text) and Recursive (used for code blocks per request)
import hmUrl from "./fonts/hm-m.woff2";
import recursiveUrl from "./fonts/Recursive.woff2";

function createStyle(css: string) {
  const style = document.createElement("style");
  style.setAttribute("data-site-fonts", "true");
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

function addPreload(url: string) {
  // Avoid adding multiple identical preloads
  if (!url) return;
  if (document.querySelector(`link[data-site-preload][href="${url}"]`))
    return;
  const link = document.createElement("link");
  link.setAttribute("data-site-preload", "true");
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
 * Inject @font-face definitions and CSS variables to use site fonts.
 * Uses imported asset URLs so build emits hashed filenames.
 */
export function injectSiteFonts() {
  if (typeof document === "undefined") return;
  if (injected) return;
  injected = true;

  // Ensure URLs are present
  const hm = String(hmUrl || "");
  const rec = String(recursiveUrl || "");

  // Build font-face CSS using the resolved URLs.
  // Keep local() first to prefer system-installed fonts, then our bundled asset URL.
  const css = `
/* HM-M for body text */
@font-face {
  font-family: "HM-M";
  src: local("HM-M"), url("${hm}") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}

/* Recursive for code blocks (as requested) */
@font-face {
  font-family: "Recursive";
  src: local("Recursive"), local("Recursive Variable"), url("${rec}") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Override VitePress font variables: body uses HM-M, monospace (code) uses Recursive */
:root {
  --vp-font-family-base: "HM-M", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --vp-font-family-mono: "Recursive", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
}
`;

  createStyle(css);

  // Add preload links to help the browser fetch fonts earlier (useful in dev and prod)
  if (rec) addPreload(rec);
  if (hm) addPreload(hm);
}

// Default: run on import in client environments.
// If you prefer manual control, import and call `injectSiteFonts()` instead of importing this file.
if (typeof window !== "undefined") {
  try {
    injectSiteFonts();
  } catch (e) {
    // avoid breaking the theme if injection fails
    // keep silent; developer can call injectSiteFonts() manually for debugging
    // eslint-disable-next-line no-console
    console.warn("[use-fonts] failed to inject site fonts:", e);
  }
}

export default injectSiteFonts;
