import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-600">Loading...</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
