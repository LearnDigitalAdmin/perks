// Public Firebase web config (identifiers, not secrets). Restrict the API key by HTTP referrer
// (perks.samuhia.co.ke, localhost) in Google Cloud Console > APIs & Services > Credentials.
// false = live app; add ?demo=1 to the URL for the local demo.
export const DEMO_MODE = false;

export const firebaseConfig = {
  apiKey: 'AIzaSyDuEPDV2wpBtgfSW6L4v05PVUxeaFkW3k0',
  authDomain: 'plot-9fd6e.firebaseapp.com',
  databaseURL: 'https://plot-9fd6e-default-rtdb.firebaseio.com',
  projectId: 'plot-9fd6e',
  storageBucket: 'plot-9fd6e.firebasestorage.app',
  messagingSenderId: '1037620305589',
  appId: '1:1037620305589:web:c88db39dd1a456fcb068fc',
  measurementId: 'G-QW47XWGCNS',
};
