// Live-mode Firebase client, loaded only when DEMO_MODE is false. No build step: SDK comes from the CDN.
import { firebaseConfig } from './config.js';

const V = '10.14.1';
let app;

export async function initLive() {
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  app = initializeApp(firebaseConfig);
  const { getAnalytics, isSupported } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-analytics.js`);
  if (await isSupported()) getAnalytics(app);
  return app;
}

export const getApp = () => app;
