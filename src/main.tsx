import { StrictMode } from 'react';
// 1️⃣ Push the WebView below the iOS status bar:
import { StatusBar } from '@capacitor/status-bar';

// Immediately disable overlay so your UI starts below the notch
(async () => {
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // ignore if running in a non-Capacitor/web context
  }
})();

import { createRoot } from 'react-dom/client';
import { AppWrapper as App } from './App.tsx';
import { SupabaseProvider } from './hooks/useSupabase'; // 🔥 ADD THIS IMPORT
import { ThemeProvider } from './contexts/ThemeContext';
import { TextSizeProvider } from './contexts/TextSizeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseProvider> {/* 🔥 ADD THIS - Should be outermost for auth /}
      <LanguageProvider>
        <ThemeProvider>
          <TextSizeProvider>
            <App />
          </TextSizeProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SupabaseProvider> {/ 🔥 CLOSE IT HERE */}
  </StrictMode>
);