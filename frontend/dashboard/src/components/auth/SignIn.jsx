import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import spLogo from '../../assets/safepulse-icon.png';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import ForgotPassword from './ForgotPassword';


function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export default function SignIn({ onSuccess, onRequestAccess }) {
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_email'));
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setAuthError('');
  const fieldErrors = validate({ email, password });
  if (Object.keys(fieldErrors).length > 0) {
    setErrors(fieldErrors);
    return;
  }
  setErrors({});
  setLoading(true);

  try {
    const res = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log('Login response:', data);

    if (!res.ok) {
      setAuthError(data.detail || 'Invalid credentials. Please check your email and password.');
      return;
    }

    // Save tokens to localStorage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    onSuccess?.();
  } catch (_err) {
    console.error('Login error;', _err);
    setAuthError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const focusStyle = { borderColor: '#1b4332', boxShadow: '0 0 0 3px rgba(27,67,50,0.12)' };
  const blurStyle = { borderColor: '#e5e7eb', boxShadow: 'none' };
  const errorStyle = { borderColor: '#f87171', background: '#fff5f5', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)' };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Left panel */}
      <div
        className="hidden md:flex flex-col flex-1 relative overflow-hidden"
        style={{ background: '#1b4332' }}
      >
        <div className="absolute rounded-full" style={{ width: '500px', height: '500px', border: '1px solid rgba(255,255,255,0.06)', top: '-120px', left: '-150px' }} />
        <div className="absolute rounded-full" style={{ width: '360px', height: '360px', border: '1px solid rgba(255,255,255,0.06)', top: '-60px', left: '-80px' }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3 mb-auto">
            <img src={spLogo} alt="SafePulse Logo" className="w-10 h-10" />
            <span className="text-white font-semibold text-lg">SafePulse</span>
          </div>

          <div className="mb-auto pb-10">
            <p className="text-emerald-300/80 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              NGO Console
            </p>
            <h2 className="text-white text-3xl font-semibold leading-tight [word-spacing:0.5rem] mb-4" style={{ maxWidth: '500px' }}>
              Turn anonymous signals into visible action.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed" style={{ maxWidth: '400px' }}>
              A live monitoring center for community safety teams. Triage incidents, spot patterns and coordinate response – All in one calm operational view.
            </p>
            <div className="flex items-center gap-2 mt-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white/60 text-sm">All channels live . SMS . App . Web</span>
            </div>
          </div>

          <p className="text-white/30 text-xs">© 2026 SafePulse . Confidential</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10" style={{ background: '#f5f4ef' }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Sign In</h1>
            <p className="text-gray-500 text-sm">Use your NGO admin credentials to continue</p>
          </div>

          {authError && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
              {authError}
            </div>
          )}
          {/*
          <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-emerald-50 border border-emerald-200">
            <p className="text-emerald-800 font-medium">Demo credentials:</p>
            <p className="text-emerald-700 mt-1">Email: <code className="bg-emerald-100 px-1.5 py-0.5 rounded">demo@ngo.org</code></p>
            <p className="text-emerald-700">Password: <code className="bg-emerald-100 px-1.5 py-0.5 rounded">demo123</code></p>
          </div>
            */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="Your@ngo.org"
                className="w-full px-4 py-3 rounded-full border text-sm outline-none transition-all duration-200 placeholder-gray-400"
                style={errors.email ? errorStyle : { borderColor: '#e5e7eb', background: '#fff' }}
                onFocus={(e) => { if (!errors.email) Object.assign(e.target.style, focusStyle); }}
                onBlur={(e) => { if (!errors.email) Object.assign(e.target.style, blurStyle); }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-full border text-sm outline-none transition-all duration-200 placeholder-gray-400"
                  style={errors.password ? errorStyle : { borderColor: '#e5e7eb', background: '#fff' }}
                  onFocus={(e) => { if (!errors.password) Object.assign(e.target.style, focusStyle); }}
                  onBlur={(e) => { if (!errors.password) Object.assign(e.target.style, blurStyle); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-emerald-700"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-emerald-500 hover:text-gray-800 transition-colors text-sm"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
              style={{ background: '#1b4332' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New partner organization?{' '}
            <button
              onClick={onRequestAccess}
              className="font-medium transition-colors hover:underline cursor-pointer"
              style={{ color: '#1b6b4a' }}
            >
              Request access
            </button>
          </p>
        </div>
      </div>
      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}
