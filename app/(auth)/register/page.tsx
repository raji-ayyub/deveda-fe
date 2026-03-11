'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { getRoleRegistrationRedirect } from '@/lib/roleRoutes';

const passwordRules = [
  'At least 8 characters',
  'Includes one letter',
  'Includes one number',
];

const accountTypes = [
  {
    value: 'Student',
    label: 'Student',
    description: 'For learners following the coding tracks and earning certificates.',
    title: 'Create your learner account',
    intro: 'Start with guided coding paths, quizzes, and milestone celebrations.',
    nextStep: 'After signup, you will land in your learner profile with progress tracking and certificates.',
    highlights: ['Structured courses', 'Quiz checkpoints', 'Certificates and accolades'],
  },
  {
    value: 'Instructor',
    label: 'Instructor',
    description: 'For instructors building courses, assessments, and structured teaching plans.',
    title: 'Create your instructor workspace',
    intro: 'Set up a teaching account focused on curriculum, courses, and assessment authoring.',
    nextStep: 'After signup, you will land in your instructor profile instead of the learner experience.',
    highlights: ['Curriculum tools', 'Question bank access', 'Separate instructor workspace'],
  },
];

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedAccountType = accountTypes.find((accountType) => accountType.value === formData.role) || accountTypes[0];

  const passwordValid = useMemo(() => {
    return (
      formData.password.length >= 8 &&
      /[A-Za-z]/.test(formData.password) &&
      /\d/.test(formData.password)
    );
  }, [formData.password]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }

    if (!passwordValid) {
      setError('Use a stronger password with at least 8 characters, one letter, and one number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('You need to accept the terms to continue.');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.role
      );
      router.push(getRoleRegistrationRedirect(formData.role));
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center">
        <div className="w-full space-y-8 rounded-xl bg-white p-8 shadow-lg shadow-blue-100">
          <div>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-2xl font-bold text-white">D</span>
              </div>
            </div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {selectedAccountType.title}
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              {selectedAccountType.intro}
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already registered?{' '}
              <Link href="/login" className="font-medium text-blue-600 transition hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {accountTypes.map((accountType) => (
                <button
                  key={accountType.value}
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, role: accountType.value }))}
                  className={`rounded-xl border p-4 text-left transition ${
                    formData.role === accountType.value
                      ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{accountType.label}</div>
                  <div className="mt-2 text-sm text-gray-600">{accountType.description}</div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
              <p className="text-sm font-semibold text-blue-950">{selectedAccountType.nextStep}</p>
              <div className="mt-3 grid gap-2 text-sm text-blue-900 md:grid-cols-3">
                {selectedAccountType.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-lg bg-white px-3 py-2">
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="Ada"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="Lovelace"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="Choose a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    placeholder="Repeat your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-500"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-4">
              <p className="text-sm font-medium text-blue-900">Password checklist</p>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                {passwordRules.map((rule) => (
                  <div
                    key={rule}
                    className={`rounded-lg px-3 py-2 ${
                      passwordValid ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-gray-600'
                    }`}
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>I agree to the platform terms and privacy policy for the official Deveda launch.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : `Create ${formData.role.toLowerCase()} account`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
