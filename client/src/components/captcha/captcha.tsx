import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  siteKey?: string;
  type?: 'google' | 'hcaptcha';
}

export const Captcha: React.FC<CaptchaProps> = ({
  onVerify,
  onExpire,
  siteKey,
  type = 'google'
}) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  // Obtener la configuración de captcha del servidor
  const { data: captchaConfig, isLoading } = useQuery({
    queryKey: ['/api/settings/captcha'],
    enabled: !siteKey, // Solo hacer la petición si no se proporciona un siteKey
  });

  // Determinar la clave a utilizar
  const key = siteKey || (captchaConfig?.siteKey || '');

  useEffect(() => {
    // Si no hay clave, no intentar cargar el captcha
    if (!key) return;

    // Función para cargar la librería de reCAPTCHA
    const loadReCaptcha = (callback: () => void) => {
      if (window.grecaptcha) {
        callback();
        return;
      }

      // Agregar script para Google reCAPTCHA
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.body.appendChild(script);
    };

    // Función para cargar la librería de hCaptcha
    const loadHCaptcha = (callback: () => void) => {
      if (window.hcaptcha) {
        callback();
        return;
      }

      // Agregar script para hCaptcha
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.body.appendChild(script);
    };

    // Renderizar el captcha según el tipo
    const renderCaptcha = () => {
      if (!captchaRef.current) return;

      if (type === 'google' && window.grecaptcha) {
        widgetId.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: key,
          callback: onVerify,
          'expired-callback': onExpire
        });
      } else if (type === 'hcaptcha' && window.hcaptcha) {
        widgetId.current = window.hcaptcha.render(captchaRef.current, {
          sitekey: key,
          callback: onVerify,
          'expired-callback': onExpire
        });
      }
    };

    // Cargar y renderizar el captcha adecuado
    if (type === 'google') {
      loadReCaptcha(renderCaptcha);
    } else {
      loadHCaptcha(renderCaptcha);
    }

    // Limpieza al desmontar
    return () => {
      if (type === 'google' && window.grecaptcha && widgetId.current !== null) {
        window.grecaptcha.reset(widgetId.current);
      } else if (type === 'hcaptcha' && window.hcaptcha && widgetId.current !== null) {
        window.hcaptcha.reset(widgetId.current);
      }
    };
  }, [key, type, onVerify, onExpire]);

  if (isLoading) {
    return <div className="h-[78px] flex items-center justify-center bg-neutral-50 rounded border">Cargando captcha...</div>;
  }

  if (!key) {
    return null; // Si no hay clave, no mostrar el captcha
  }

  return <div ref={captchaRef} className="mt-2"></div>;
};

// Declarar los tipos globales para las librerías de captcha
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        element: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId: number) => void;
    };
    hcaptcha?: {
      render: (
        element: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId: number) => void;
    };
  }
}