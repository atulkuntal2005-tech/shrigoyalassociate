import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BUSINESS_INFO } from '../../lib/constants';
import { SEOHead } from '../../components/SEOHead';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function AdminLoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!loading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Email/Password sign-in is not yet enabled in your Firebase Console. Sign in immediately below using your Google Account, or enable Email/Password provider in Firebase Authentication.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err?.message || 'Google Sign-In could not be completed.');
      }
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#faf9f6] px-4 py-12">
      <SEOHead
        title="Admin Login | Shri Goyal Associate"
        description="Secure Admin CMS Login for Shri Goyal Associate."
        noIndex
      />

      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-[#9a7b3e]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Return to Public Website
          </Link>
          {/* SINGLE H1 ON ADMIN LOGIN PAGE */}
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#18181b]">
            {BUSINESS_INFO.companyName}
          </h1>
          <p className="text-sm text-stone-600">
            Secure Property &amp; Lead Management Portal
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-7 sm:p-8 space-y-6">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 leading-relaxed"
            >
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email & Password Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="jgoyal156@gmail.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={submitting || googleSubmitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In with Email &amp; Password
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-stone-400">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={submitting || googleSubmitting}
            onClick={handleGoogleLogin}
          >
            {googleSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting Google Account...
              </>
            ) : (
              'Sign In with Verified Google Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
