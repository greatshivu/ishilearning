import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

const Turnstile: React.FC<TurnstileProps> = ({ onVerify }) => {
  const disabled = import.meta.env.VITE_DISABLE_TURNSTILE === "true";
  const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY; // Always Pass Test Sitekey

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (disabled) {
      onVerify("dev-token");
      return;
    }

    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const renderWidget = () => {
      if (containerRef.current && (window as any).turnstile && !widgetIdRef.current) {
        widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
          sitekey: sitekey,
          callback: (token: string) => onVerify(token),
          'error-callback': (error: any) => console.error('Turnstile error:', error),
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else if ((window as any).turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && (window as any).turnstile) {
        (window as any).turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, sitekey, disabled]);

  if (disabled) {
    return <div className="p-2 border rounded bg-gray-100 dark:bg-gray-800 text-sm text-center">Turnstile disabled in dev</div>;
  }

  return <div ref={containerRef}></div>;
};

export default Turnstile;
/**
 * -import React, { useEffect, useRef } from 'react';
-
-
-interface TurnstileProps {
-  onVerify: (token: string) => void;
-}
-
-const Turnstile: React.FC<TurnstileProps> = ({ onVerify }) => {
-  const disabled = import.meta.env.VITE_DISABLE_TURNSTILE === "true";
-  const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY;
-
-  if (disabled) {
-    onVerify("dev-token");
-    return <div>Turnstile disabled in dev</div>;
-  }
-  const containerRef = useRef<HTMLDivElement>(null);
-
-  useEffect(() => {
-    const script = document.createElement('script');
-    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
-    script.async = true;
-    script.defer = true;
-    document.head.appendChild(script);
-    if (!(window as any).turnstile) return;
-
-    const widgetId = (window as any).turnstile.render(containerRef.current, {
-      sitekey: sitekey ?? '0x4AAAAAADUoSzT7xl27MFln',
-      callback: (token: string) => onVerify(token),
-    });
-
-    return () => {
-      (window as any).turnstile.remove(widgetId);
-      document.head.removeChild(script);
-    };
-  }, [onVerify]);
-
-  return <div ref={containerRef}></div>;
-};
-
-export default Turnstile;
-
-
-// import React, { useEffect, useRef } from 'react';
-
-// interface TurnstileProps {
-//   onVerify: (token: string) => void;
-// }
-
-// const Turnstile: React.FC<TurnstileProps> = ({ onVerify }) => {
-//   const containerRef = useRef<HTMLDivElement>(null);
-
-//   useEffect(() => {
-//     // const script = document.createElement('script');
-//     // script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
-//     // script.async = true;
-//     // script.defer = true;
-//     // document.head.appendChild(script);
-
-//     (window as any).onloadTurnstileCallback = () => {
-//       (window as any).turnstile.render(containerRef.current, {
-//         sitekey: '0x4AAAAAADUoSy-vKWAEvS20mD2W38b06No', // Placeholder
-//         callback: (token: string) => onVerify(token),
-//       });
-//     };
-
-//     return () => {
-//       // document.head.removeChild(script);
-//     };
-//   }, [onVerify]);
-
-//   return <div ref={containerRef}></div>;
-// };
-
-// export default Turnstile;
 */