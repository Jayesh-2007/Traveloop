import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/shared/Button.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import useAuth from '../hooks/useAuth.js';

function getErrorMessage(error) {
  const response = error.response?.data;

  if (response?.errors?.length > 0) {
    return response.errors.map((item) => item.message).join(' ');
  }

  return response?.message || 'Unable to log in. Please try again.';
}

function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success('Welcome back to Traveloop');
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-6 shadow-xl shadow-slate-200/80 sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/20">
            <Compass size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">Traveloop</p>
            <p className="text-xs font-medium text-slate-500">Sign in to your planning workspace</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use your demo or registered account to continue planning.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} />}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              className="traveloop-input"
              name="email"
              onChange={handleChange}
              placeholder="parshuram@traveloop.test"
              type="email"
              value={formData.email}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <input
              className="traveloop-input"
              name="password"
              onChange={handleChange}
              placeholder="password123"
              type="password"
              value={formData.password}
            />
          </label>

          <Button className="w-full" disabled={isLoading} size="lg" type="submit">
            <LogIn size={17} aria-hidden="true" />
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to Traveloop?{' '}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
