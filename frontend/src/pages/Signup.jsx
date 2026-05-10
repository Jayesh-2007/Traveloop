import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/shared/Button.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import useAuth from '../hooks/useAuth.js';

function getErrorMessage(error) {
  const response = error.response?.data;

  if (response?.errors?.length > 0) {
    return response.errors.map((item) => item.message).join(' ');
  }

  return response?.message || 'Unable to create account. Please try again.';
}

function Signup() {
  const { isAuthenticated, isLoading, register } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  function validateForm() {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      return 'Name, email, and password are required.';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success('Account created');
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
            <p className="text-xs font-medium text-slate-500">Create your planning account</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign up with email and password to save your Traveloop session.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} />}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
            <input
              className="traveloop-input"
              name="name"
              onChange={handleChange}
              placeholder="Jayesh Traveler"
              type="text"
              value={formData.name}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              className="traveloop-input"
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
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
              placeholder="At least 8 characters"
              type="password"
              value={formData.password}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</span>
            <input
              className="traveloop-input"
              name="confirmPassword"
              onChange={handleChange}
              placeholder="Repeat password"
              type="password"
              value={formData.confirmPassword}
            />
          </label>

          <Button className="w-full" disabled={isLoading} size="lg" type="submit">
            <UserPlus size={17} aria-hidden="true" />
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Signup;
