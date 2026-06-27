"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => void;
    };
  }
}

export function VLibras() {
  useEffect(() => {
    if (document.querySelector("[vw]")) return;

    const div = document.createElement("div");
    div.setAttribute("vw", "");
    div.setAttribute("class", "enabled");
    div.innerHTML =
      '<div vw-access-button class="active"></div>' +
      '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(div);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@sgd/app/vlibras-plugin.js";
    script.onload = () => {
      try {
        if (window.VLibras?.Widget) {
          new window.VLibras.Widget("https://vlibras.gov.br/app");
        }
      } catch (e) {
        console.warn("VLibras: falha ao inicializar", e);
      }
    };
    script.onerror = () => console.warn("VLibras: script não pôde ser carregado.");
    document.head.appendChild(script);
  }, []);

  return null;
}
