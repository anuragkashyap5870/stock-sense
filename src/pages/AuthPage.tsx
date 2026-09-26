import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { Logo } from '../components/common/Logo';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, showToast } = useInventory();

  const [mode, setMode] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_newpass' | 'forgot_success'>('login');
  const [email, setEmail] = useState('admin@stocksense.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your work email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const success = login(email.trim(), password);
    if (!success) {
      setErrorMsg('Invalid email or password. You can use demo credentials.');
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@stocksense.com');
    setPassword('admin123');
    setErrorMsg('');
    showToast('Demo Credentials Loaded', 'Click "Sign In" or press Enter.', 'info');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid company email address.');
      return;
    }
    setErrorMsg('');
    setOtp('4829'); // simulated OTP
    setMode('forgot_otp');
    showToast('OTP Dispatched', 'A 4-digit verification code has been sent (Demo Code: 4829).', 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '4829' && otp.length < 4) {
      setErrorMsg('Invalid OTP. Use demo code: 4829.');
      return;
    }
    setErrorMsg('');
    setMode('forgot_newpass');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    setMode('forgot_success');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center p-4 selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md bg-[#171A20] border border-[#292D35] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size="lg" />
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Smart Inventory. Real-Time Control.
          </p>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="admin@stocksense.com"
                  className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('forgot_email');
                  }}
                  className="text-[11px] font-mono text-[#F59E0B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0B0D10] border-[#292D35] text-[#F59E0B] focus:ring-0 cursor-pointer"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs text-[#EF4444] font-medium bg-[#EF4444]/10 p-2.5 rounded-lg border border-[#EF4444]/30">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Credential Pill */}
            <div className="pt-2 border-t border-[#292D35]/60 flex flex-col items-center space-y-2">
              <span className="text-[11px] text-[#64748B] font-mono">Demo Evaluation Credentials:</span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full p-2.5 rounded-lg bg-[#0B0D10] hover:bg-[#1E222A] border border-[#292D35] text-left flex items-center justify-between text-xs font-mono transition-colors group"
              >
                <div>
                  <span className="text-[#F8FAFC] font-semibold block">admin@stocksense.com</span>
                  <span className="text-[#94A3B8] text-[10px]">Pass: admin123</span>
                </div>
                <span className="text-[10px] text-[#F59E0B] group-hover:underline">One-Click Fill →</span>
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD - STEP 1: EMAIL */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Password Recovery</h3>
              <p className="text-xs text-[#94A3B8]">
                Enter your registered corporate email to receive a recovery code.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stocksense.com"
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>

            {errorMsg && <p className="text-xs text-[#EF4444]">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F59E0B] text-[#0B0D10] font-bold text-xs rounded-lg transition-all"
            >
              Send Verification OTP
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD - STEP 2: OTP */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Enter Verification Code</h3>
              <p className="text-xs text-[#94A3B8]">
                Sent to <strong className="text-[#F8FAFC]">{email}</strong>. (Demo Code: 4829)
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8]">4-Digit OTP</label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="4829"
                className="w-full bg-[#0B0D10] border border-[#292D35] text-center font-mono font-bold text-lg rounded-lg px-3 py-2 text-[#F8FAFC] focus:outline-none tracking-widest"
              />
            </div>

            {errorMsg && <p className="text-xs text-[#EF4444]">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F59E0B] text-[#0B0D10] font-bold text-xs rounded-lg transition-all"
            >
              Verify Code &amp; Continue
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD - STEP 3: NEW PASSWORD */}
        {mode === 'forgot_newpass' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Create New Password</h3>
              <p className="text-xs text-[#94A3B8]">Must be at least 6 characters.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8]">Confirm Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>

            {errorMsg && <p className="text-xs text-[#EF4444]">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F59E0B] text-[#0B0D10] font-bold text-xs rounded-lg transition-all"
            >
              Update Password &amp; Sign In
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD - STEP 4: SUCCESS */}
        {mode === 'forgot_success' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Password Updated Successfully!</h3>
            <p className="text-xs text-[#94A3B8]">
              Your operator credentials have been securely reconciled.
            </p>
            <button
              onClick={() => {
                setPassword(newPassword);
                setMode('login');
              }}
              className="w-full py-2.5 bg-[#F59E0B] text-[#0B0D10] font-bold text-xs rounded-lg transition-all"
            >
              Sign In with New Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
