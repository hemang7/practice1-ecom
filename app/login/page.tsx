import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-600">Loading...</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
