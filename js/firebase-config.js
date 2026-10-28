/**
 * AGRABAD DEGREE COLLEGE - FIREBASE CONFIGURATION & ADAPTER
 * Supports both Live Firebase (v10+ Modular SDK) and high-fidelity Local Sandbox Mode.
 * Real credentials should be supplied via environment or hosting deployment.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyADC_DEMO_KEY_PLACEHOLDER_FOR_LOCAL_EVAL",
  authDomain: "agrabad-college-demo.firebaseapp.com",
  projectId: "agrabad-college-demo",
  storageBucket: "agrabad-college-demo.appspot.com",
  messagingSenderId: "109823482019",
  appId: "1:109823482019:web:38b0219ca9012"
};

// Check if running in demo/offline mode vs live Firebase
export const isLiveFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         !firebaseConfig.apiKey.includes('PLACEHOLDER') && 
         firebaseConfig.projectId !== 'agrabad-college-demo';
};

console.log(
  `%c[Agrabad Degree College System]%c Mode: ${isLiveFirebaseConfigured() ? 'Cloud Firebase' : 'High-Fidelity Local Engine (Mock/Sandbox)'}`,
  'background: #0c2340; color: #fbbf24; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
  'color: #1a56db; font-weight: bold;'
);
