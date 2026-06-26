"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => void;
    };
  }
}

export function VLibras() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.setAttribute("vw", "");
    el.classList.add("enabled");

    const btn = el.children[0] as HTMLElement | undefined;
    btn?.setAttribute("vw-access-button", "");
    btn?.classList.add("active");

    const wrapper = el.children[1] as HTMLElement | undefined;
    wrapper?.setAttribute("vw-plugin-wrapper", "");
  }, []);

  return (
    <>
      <div ref={containerRef}>
        <div />
        <div>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>

      <Script
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
        onError={() => console.warn("VLibras: script não pôde ser carregado.")}
      />
    </>
  );
}
