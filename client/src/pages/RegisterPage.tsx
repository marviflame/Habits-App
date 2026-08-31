import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState, watch } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '' }
  });
  const password = watch('password', '');

  const onSubmit = async (values: RegisterForm) => {
    try {
      const { data } = await api.post('/auth/register', values);
      setAuth(data.user, data.token);
      toast.success(`Account created. Welcome, ${data.user.name}!`);
      navigate('/', { replace: true });
    } catch (e: any) {
      const err = e?.response?.data?.error;
      const msg = typeof err === 'string' ? err : 'Could not create account';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-slate-50">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1">Start building better habits today</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              className="input"
              placeholder="Jane Doe"
              autoComplete="name"
              {...register('name', { required: 'Name is required', minLength: 1 })}
            />
            {formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email', { required: 'Email is required' })}
            />
            {formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' }
              })}
            />
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.password.message}</p>
            )}
            {password && password.length < 6 && (
              <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
            )}
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
