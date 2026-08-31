import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const { data } = await api.post('/auth/login', values);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/', { replace: true });
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Login failed. Check your credentials.';
      toast.error(typeof msg === 'string' ? msg : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-slate-50">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="text-5xl mb-2">✅</div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to continue building your habits</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">{formState.errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="btn-primary w-full py-2.5"
          >
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </div>
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="font-semibold mb-1">💡 Test it quickly:</div>
          Register with a dummy email (e.g. <code>test@test.com</code>) and password (<code>123456</code>).
        </div>
      </div>
    </div>
  );
}
