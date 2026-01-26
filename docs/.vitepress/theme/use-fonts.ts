import hmUrl from "./fonts/hm-m.woff2";
import hurmitUrl from "./fonts/HurmitNerdFontMono-Regular.woff2";

function createStyle(css: string) {
  const style = document.createElement("style");
  style.setAttribute("data-site-fonts", "true");
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

function addPreload(url: string) {
  if (!url) return;
  if (document.querySelector(`link[data-site-preload][href="${url}"]`)) return;
  const link = document.createElement("link");
  link.setAttribute("data-site-preload", "true");
  link.rel = "preload";
  link.href = url;
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "";
  document.head.appendChild(link);
}

let injected = false;

export function injectSiteFonts() {
  if (typeof document === "undefined") return;
  if (injected) return;
  injected = true;

  // Ensure URLs are present
  const hm = String(hmUrl || "");
  const hurmit = String(hurmitUrl || "");

  const css = `
/* HM-M for body text */
@font-face {
  font-family: "HM-M";
  src: local("HM-M"), url("${hm}") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}

/* Hurmit for code blocks (as requested) */
@font-face {
  font-family: "Hurmit";
  src: local("Hurmit"), local("HurmitNerdFontMono"), url("${hurmit}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Override VitePress font variables: body uses HM-M, monospace (code) uses Hurmit */
:root {
  --vp-font-family-base: "HM-M", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --vp-font-family-mono: "Hurmit", ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
}
`;

  createStyle(css);

  if (hurmit) addPreload(hurmit);
  if (hm) addPreload(hm);
}

if (typeof window !== "undefined") {
  try {
    injectSiteFonts();
  } catch (e) {
    console.warn("[use-fonts] failed to inject site fonts:", e);
  }
}

export default injectSiteFonts;
