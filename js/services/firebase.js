// Real Firebase runtime (no build step: modular SDK straight from the CDN, pinned). Provides the transport and auth objects
// the rest of the app uses, so nothing else imports Firebase.
import { firebaseConfig } from '../firebase/config.js';
import { ApiError } from './api.js';

const V = '10.14.1', CDN = `https://www.gstatic.com/firebasejs/${V}/`;
const REGION = 'africa-south1';

const CODES = {
  'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'Wrong email or password.',
  'auth/invalid-email': 'Enter a valid email address.', 'auth/too-many-requests': 'Too many attempts. Please wait a few minutes.', 'auth/network-request-failed': 'Network problem. Check your connection.',
  'auth/invalid-custom-token': 'Sign-in failed. Please request a new code.',
};
function toApiError(e) {
  const code = String(e?.code || '').replace('functions/', '');
  if (CODES[code]) return new ApiError(code, CODES[code]);
  if (code === 'unauthenticated') return new ApiError(code, 'Please sign in again.');
  if (code === 'internal' || code === 'unavailable' || code === 'deadline-exceeded' || !code) return new ApiError(code || 'unavailable', 'Network problem. Please try again.');
  return new ApiError(code, e.message || 'Something went wrong.');
}

export async function createFirebaseRuntime() {
  const [{ initializeApp }, A, F] = await Promise.all([import(CDN + 'firebase-app.js'), import(CDN + 'firebase-auth.js'), import(CDN + 'firebase-functions.js')]);
  const app = initializeApp(firebaseConfig), auth = A.getAuth(app), fns = F.getFunctions(app, REGION);
  const call = (name) => { const fn = F.httpsCallable(fns, name); return async (data) => { try { return (await fn(data)).data; } catch (e) { throw toApiError(e); } }; };
  const callOp = call('perks_op'), callMe = call('perks_me'), sendOtp = call('sendLoginOtp'), verifyOtp = call('verifyLoginOtp');
  return {
    live: true,
    transport: { op: (action, payload) => callOp({ action, payload }), me: (action, payload) => callMe({ action, payload }) },
    auth: {
      async signInOperator(email, password) { try { await A.signInWithEmailAndPassword(auth, email, password); } catch (e) { throw toApiError(e); } },
      sendOtp: (phone) => sendOtp({ phone, product: 'perks' }),
      async verifyOtp(phone, code) { const { token } = await verifyOtp({ phone, code, product: 'perks' }); try { await A.signInWithCustomToken(auth, token); } catch (e) { throw toApiError(e); } },
      signOut: () => A.signOut(auth),
      onChange: (cb) => A.onAuthStateChanged(auth, async (u) => {
        if (!u) return cb(null);
        const t = await u.getIdTokenResult();
        cb({ uid: u.uid, email: u.email || null, phone: t.claims.otp_phone || null });
      }),
    },
  };
}
