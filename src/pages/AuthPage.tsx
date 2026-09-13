import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  User,
  ExternalLink,
  ArrowLeft,
  Play,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { firebaseProjectId } from '../firebase/config';

interface AuthPageProps {
  initialIsSignUp?: boolean;
  onCancel?: () => void;
  onGuestPlay?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialIsSignUp = false,
  onCancel,
  onGuestPlay,
}) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, signUp, authError, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (isSignUp && !name.trim()) {
      setFormError('Please enter your adventurer name.');
      return;
    }
    if (!trimmedEmail) {
      setFormError('Please enter your email.');
      return;
    }
    if (!trimmedPass) {
      setFormError('Please enter your password.');
      return;
    }
    if (trimmedPass.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      if (isSignUp) {
        await signUp(name.trim(), trimmedEmail, trimmedPass);
      } else {
        await login(trimmedEmail, trimmedPass);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = formError || authError;
  const isOperationNotAllowed =
    activeError?.toLowerCase().includes('operation-not-allowed') ||
    activeError?.toLowerCase().includes('sign-in is not enabled');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {onCancel && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Landing Page</span>
            </button>
          </div>
        )}

        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/5">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            LIFE RPG
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-amber-400/80 font-semibold">
            Task Mastery • Attribute Ascension
          </p>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            Transform your everyday goals into legendary quests. Earn XP, maintain streaks, and forge your legacy.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rpg-card p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-900/90 p-1 border border-white/5 mb-6">
            <button
              type="button"
              id="switch-login-tab"
              onClick={() => {
                setIsSignUp(false);
                setFormError(null);
                clearError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="switch-signup-tab"
              onClick={() => {
                setIsSignUp(true);
                setFormError(null);
                clearError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Begin Journey
            </button>
          </div>

          {/* Actionable Error Resolution Card */}
          {activeError && isOperationNotAllowed ? (
            <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-300 text-sm">
                    Enable Email/Password in Firebase Console
                  </h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Firebase Authentication requires the <strong>Email/Password</strong> provider to be switched ON in project <code className="text-amber-300 font-mono text-[11px]">{firebaseProjectId || 'singular-bot-rnn32'}</code>.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-black/40 p-3 border border-white/5 text-slate-300 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">1</span>
                  <span>Click link below to open your Firebase Console tab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">2</span>
                  <span>Click <strong>Email/Password</strong> under Sign-in providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">3</span>
                  <span>Turn the <strong>Enable</strong> switch ON and click <strong>Save</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseProjectId || 'singular-bot-rnn32'}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <span>Open Firebase Auth Providers</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setFormError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  Dismiss & Try Again
                </button>
              </div>
            </div>
          ) : activeError ? (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{activeError}</span>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="auth-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Hero Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alex the Resolute"
                    disabled={submitting}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@realm.com"
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Secret Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Minimum 6 characters with secure Firebase protection.
              </p>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isSignUp ? 'Inscribe New Character' : 'Enter the Realm'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                {isSignUp ? (
                  <>
                    Already forged your character?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setFormError(null);
                        clearError();
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer ml-1"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    First time in the realm?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setFormError(null);
                        clearError();
                      }}
                      className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer ml-1"
                    >
                      Begin your journey
                    </button>
                  </>
                )}
              </p>
            </div>

            {onGuestPlay && (
              <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <p className="text-xs text-slate-400 mb-2.5">
                  Prefer not to register right now?
                </p>
                <button
                  type="button"
                  id="auth-guest-play-btn"
                  onClick={onGuestPlay}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:border-amber-500/60"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-amber-400" />
                  <span>Play Free as Guest Hero (Local Save)</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
