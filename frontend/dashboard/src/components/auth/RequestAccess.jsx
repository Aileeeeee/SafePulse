import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import spLogo from '../../assets/safepulse-icon.png';


const REGIONS = [
  'Lagos, Nigeria', 'Abuja, Nigeria', 'Kano, Nigeria', 'Ibadan, Nigeria',
  'Port Harcourt, Nigeria', 'Nairobi, Kenya', 'Accra, Ghana',
  'Kampala, Uganda', 'Dar es Salaam, Tanzania', 'Other',
];

function validateForm({ orgName, orgAddress, email, contactName }) {
  const errors = {};
  if (!orgName.trim()) errors.orgName = 'Organization name is required.';
  if (!orgAddress.trim()) errors.orgAddress = 'Organization address is required.';
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!contactName.trim()) errors.contactName = 'Contact person name is required.';
  return errors;
}

const focusStyle = { borderColor: '#1b4332', boxShadow: '0 0 0 3px rgba(27,67,50,0.12)' };
const blurStyle = { borderColor: '#e5e7eb', boxShadow: 'none' };
const errStyle = { borderColor: '#f87171', background: '#fff5f5', boxShadow: '0 0 0 3px rgba(248,113,113,0.15)' };
const baseStyle = { borderColor: '#e5e7eb', background: '#fff' };

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

export default function RequestAccess({ onSignIn, onSubmitted }) {
  const [form, setForm] = useState({ orgName: '', orgAddress: '', email: '', contactName: '', region: 'Lagos, Nigeria' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    onSubmitted?.();
  };

  const inputClass = "w-full px-4 py-3 rounded-full border text-sm outline-none transition-all duration-200 placeholder-gray-400";

  const commonHandlers = (key) => ({
    onFocus: (e) => { if (!errors[key]) Object.assign(e.target.style, focusStyle); },
    onBlur: (e) => { if (!errors[key]) Object.assign(e.target.style, blurStyle); },
  });

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
            <p className="text-white/60 text-sm leading-relaxed" style={{ maxWidth: '320px' }}>
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
      <div className="flex flex-1 items-center justify-center px-6 py-10 overflow-y-auto" style={{ background: '#f5f4ef' }}>
        {submitted ? (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h2>
            <p className="text-gray-500 text-sm mb-7">
              We've received your request. Our team will review and reach out within 2–3 business days.
            </p>
            <button
              onClick={onSignIn}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: '#1b4332' }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Request Access</h1>
              <p className="text-gray-500 text-sm">Tell us a bit about your organization.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <Field label="Organization name" error={errors.orgName}>
                <input
                  type="text" value={form.orgName} onChange={set('orgName')}
                  placeholder="E.g. Lagos Safety Space Initiative"
                  className={inputClass}
                  style={errors.orgName ? errStyle : baseStyle}
                  {...commonHandlers('orgName')}
                />
              </Field>

              <Field label="Organization address" error={errors.orgAddress}>
                <input
                  type="text" value={form.orgAddress} onChange={set('orgAddress')}
                  placeholder="E.g. 30, church street oshodi"
                  className={inputClass}
                  style={errors.orgAddress ? errStyle : baseStyle}
                  {...commonHandlers('orgAddress')}
                />
              </Field>

              <Field label="Email address" error={errors.email}>
                <input
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="Your@ngo.org"
                  className={inputClass}
                  style={errors.email ? errStyle : baseStyle}
                  {...commonHandlers('email')}
                />
              </Field>

              <Field label="Primary contact person" error={errors.contactName}>
                <input
                  type="text" value={form.contactName} onChange={set('contactName')}
                  placeholder="Full name"
                  className={inputClass}
                  style={errors.contactName ? errStyle : baseStyle}
                  {...commonHandlers('contactName')}
                />
              </Field>

              <Field label="Region" error={errors.region}>
                <div className="relative">
                  <select
                    value={form.region} onChange={set('region')}
                    className="w-full px-4 py-3 pr-10 rounded-full border text-sm outline-none transition-all duration-200 appearance-none cursor-pointer text-gray-700"
                    style={baseStyle}
                    onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                  >
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-1"
                style={{ background: '#1b4332' }}
              >
                {loading ? 'Submitting…' : 'Submit request'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already a partner?{' '}
              <button onClick={onSignIn} className="font-medium transition-colors hover:underline cursor-pointer" style={{ color: '#1b6b4a' }}>
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
