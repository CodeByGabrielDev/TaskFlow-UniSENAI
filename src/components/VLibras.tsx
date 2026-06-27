"use client";

import { useEffect } from "react";
import Script from "next/script";

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
  }, []);

  return (
    <Script
      id="vlibras-script"
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      strategy="afterInteractive"
      onLoad={() => {
        try {
          if (window.VLibras?.Widget) {
            new window.VLibras.Widget("https://vlibras.gov.br/app");
          }
        } catch (e) {
          console.warn("VLibras: falha ao inicializar", e);
        }
      }}
      onError={() => {
        console.warn("VLibras: script não pôde ser carregado.");
      }}
    />
  );
}
