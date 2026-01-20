"use client"
import { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    const googleTranslateElementInit = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' },
          'google_translate_element'
        );
      }
    };

    const addScript = () => {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = googleTranslateElementInit;
      document.body.appendChild(script);
    };

    const scriptExists = document.querySelector(`script[src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]`);
    if (!scriptExists) {
      window.googleTranslateElementInit = googleTranslateElementInit;
      addScript();
    } else {
      googleTranslateElementInit();
    }
  }, []);

  return <div id="google_translate_element" className="my-4"></div>;
};

export default GoogleTranslate;
