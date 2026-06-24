import { useState } from 'react';
import { X, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AUTH_ENDPOINTS } from '../../api/endpoints';

const STEPS = {
  OPTIONS: 'options',
  RESET_EMAIL: 'reset_email',
  COMING_SOON: 'coming_soon',
  CONTACT_ADMIN: 'contact_admin',
  SUCCESS: 'success',
};

export default function ForgotPassword({ onClose }) {
  const [step, setStep] = useState(STEPS.OPTIONS);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focusStyle = { borderColor: '#1b4332', boxShadow: '0 0 0 3px rgba(27,67,50,0.12)' };
  const blurStyle = { borderColor: '#e5e7eb', boxShadow: 'none' };

  const handleResetSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(AUTH_ENDPOINTS.RESET_PASSWORD || '/api/auth/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Something went wrong. Please try again.');
        return;
      }
      setStep(STEPS.SUCCESS);
    } catch (_err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* ── OPTIONS ── */}
        {step === STEPS.OPTIONS && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot your password?</h2>
              <p className="text-sm text-gray-500">Choose how you'd like to recover access.</p>
            </div>
            <div className="flex flex-col gap-3">
              <OptionButton
                title="Send reset link"
                description="We'll email you a link to reset your password."
                onClick={() => setStep(STEPS.RESET_EMAIL)}
              />
              <OptionButton
                title="Reset via admin"
                description="Have your organisation admin reset your password."
                onClick={() => setStep(STEPS.CONTACT_ADMIN)}
              />
              <OptionButton
                title="Coming soon features"
                description="See what other recovery options are on the way."
                onClick={() => setStep(STEPS.COMING_SOON)}
              />
            </div>
          </>
        )}

        {/* ── RESET EMAIL ── */}
        {step === STEPS.RESET_EMAIL && (
          <>
            <BackButton onClick={() => { setStep(STEPS.OPTIONS); setError(''); setEmail(''); }} />
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Reset via email</h2>
              <p className="text-sm text-gray-500">Enter your account email and we'll send a reset link.</p>
            </div>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@ngo.org"
                className="w-full px-4 py-3 rounded-full border text-sm outline-none transition-all duration-200 placeholder-gray-400"
                style={{ borderColor: '#e5e7eb', background: '#fff' }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>
            <button
              onClick={handleResetSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
              style={{ background: '#1b4332' }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        )}

        {/* ── SUCCESS ── */}
        {step === STEPS.SUCCESS && (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500 mb-6">
              We've sent a password reset link to <span className="font-medium text-gray-800">{email}</span>.
              Check your spam folder if you don't see it.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-all"
              style={{ background: '#1b4332' }}
            >
              Back to sign in
            </button>
          </div>
        )}

        {/* ── CONTACT ADMIN ── */}
        {step === STEPS.CONTACT_ADMIN && (
          <>
            <BackButton onClick={() => setStep(STEPS.OPTIONS)} />
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Contact your admin</h2>
              <p className="text-sm text-gray-500">Your organisation admin can reset your password directly.</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 mb-5">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 mb-1">Reach out to your admin</p>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    Contact your NGO system administrator and ask them to reset your account password
                    via the SafePulse admin panel.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-all"
              style={{ background: '#1b4332' }}
            >
              Back to sign in
            </button>
          </>
        )}

        {/* ── COMING SOON ── */}
        {step === STEPS.COMING_SOON && (
          <>
            <BackButton onClick={() => setStep(STEPS.OPTIONS)} />
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Coming soon</h2>
              <p className="text-sm text-gray-500">More recovery options are on the way.</p>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              {[
                { title: 'SMS verification', desc: 'Reset via a code sent to your registered phone number.' },
                { title: 'Two-factor recovery', desc: 'Use your backup codes to regain access.' },
                { title: 'Identity verification', desc: 'Verify your identity via your organisation ID.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-700">{item.title}
                    <span className="ml-2 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Soon</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-all"
              style={{ background: '#1b4332' }}
            >
              Back to sign in
            </button>
          </>
        )}

      </div>
    </div>
  );
}

function OptionButton({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-150 group"
    >
      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
    >
      <ArrowLeft size={15} /> Back
    </button>
  );
}
