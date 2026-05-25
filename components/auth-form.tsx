'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';
  const redirectTo = searchParams.get('redirect') ?? '/orders';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    const supabase = createClient();

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setMessage('Account created. Check your email to confirm your account, then sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">{isLogin ? 'Log in' : 'Sign up'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin
            ? 'Sign in to view your order history.'
            : 'Create an account to save and view your orders.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link
            href={
              isLogin
                ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
                : `/login?redirect=${encodeURIComponent(redirectTo)}`
            }
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
