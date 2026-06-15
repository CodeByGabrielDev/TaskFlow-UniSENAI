"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: unknown;
  }
}

export function VLibras() {
  useEffect(() => {
    if (document.getElementById("vlibras-script")) return;

    const div = document.createElement("div");
    div.setAttribute("vw", "");
    div.setAttribute("class", "enabled");
    div.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(div);

    const script = document.createElement("script");
    script.id = "vlibras-script";
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new (window.VLibras as new (url: string) => void)("https://vlibras.gov.br/app");
      }
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
