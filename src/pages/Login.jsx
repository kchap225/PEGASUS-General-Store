import { useState } from 'react';
import { ArrowLeft, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/client';

const inputClass = 'w-full rounded-xl border border-stone/20 bg-linen px-3 py-2.5 text-forest outline-none transition-colors placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (role === 'admin') {
        await authApi.adminLogin(form.email, form.password);
        navigate('/admin');
      } else if (isRegistering) {
        await authApi.customerRegister(form.name, form.email, form.password);
        navigate('/');
      } else {
        await authApi.customerLogin(form.email, form.password);
        navigate('/');
      }
    } catch (submitError) {
      setError(submitError?.message || 'We could not sign you in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setIsRegistering(false);
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-5 py-10 text-forest">
      <section className="w-full max-w-md rounded-3xl border border-stone/15 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-harvest"><ArrowLeft className="h-4 w-4" /> Back to storefront</Link>
        <div className="mb-7"><div className="mb-4 inline-flex rounded-full bg-harvest/10 p-3 text-harvest-dark">{role === 'admin' ? <ShieldCheck className="h-6 w-6" /> : <UserRound className="h-6 w-6" />}</div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Pegasus accounts</p><h1 className="mt-2 font-heading text-3xl font-extrabold">{isRegistering ? 'Create your account' : 'Welcome back'}</h1><p className="mt-2 text-sm text-stone">Sign in to manage your orders and enjoy a faster shop.</p></div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-linen p-1" role="tablist" aria-label="Account type">
          <button type="button" onClick={() => switchRole('customer')} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${role === 'customer' ? 'bg-white text-forest shadow-sm' : 'text-stone'}`}><UserRound className="mr-2 inline h-4 w-4" /> Customer</button>
          <button type="button" onClick={() => switchRole('admin')} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${role === 'admin' ? 'bg-white text-forest shadow-sm' : 'text-stone'}`}><ShieldCheck className="mr-2 inline h-4 w-4" /> Admin</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {role === 'customer' && isRegistering && <label className="block"><span className="mb-1.5 block text-sm font-medium">Full name</span><input required name="name" value={form.name} onChange={updateField} className={inputClass} placeholder="Your name" /></label>}
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Email</span><input required type="email" name="email" value={form.email} onChange={updateField} className={inputClass} placeholder="you@example.com" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Password</span><input required type="password" name="password" minLength={role === 'customer' && isRegistering ? 8 : undefined} value={form.password} onChange={updateField} className={inputClass} placeholder="Your password" /></label>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={isSubmitting} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark disabled:cursor-not-allowed disabled:opacity-60"><LogIn className="h-4 w-4" /> {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : `Sign in as ${role}`}</button>
        </form>

        {role === 'customer' && <button type="button" onClick={() => { setIsRegistering((current) => !current); setError(''); }} className="mt-5 w-full text-center text-sm font-semibold text-harvest-dark hover:text-harvest">{isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>}
      </section>
    </div>
  );
}