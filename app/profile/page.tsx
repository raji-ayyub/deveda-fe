'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, BookOpen, Bot, Calendar, CheckCircle2, ChevronRight, Mail, Settings, Trash2, Trophy } from 'lucide-react';

import { AchievementShowcase } from '@/components/achievements/AchievementShowcase';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import InstructorProfileView from '@/components/profile/InstructorProfileView';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CourseCatalog, QuizAttempt, QuizWithDetails, UserAchievement, UserCourse } from '@/lib/types';

const ProfilePage: React.FC = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalog[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState('');
  const [pendingDeleteAttemptId, setPendingDeleteAttemptId] = useState<string | null>(null);
  const [deletingAttempt, setDeletingAttempt] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role !== 'Student') {
      setUserCourses([]);
      setQuizAttempts([]);
      setQuizzes([]);
      setCourseCatalog([]);
      setAchievements([]);
      setLoading(false);
      return;
    }

    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    const loadUserData = async () => {
      try {
        setLoading(true);
        const [coursesRes, quizAttemptsRes, catalogRes, achievementsRes, quizzesRes] = await Promise.all([
          api.getUserCourses(user.id),
          api.getUserQuizAttempts(user.id),
          api.getCourseCatalog(),
          api.getUserAchievements(user.id),
          api.getQuizzes(),
        ]);

        setUserCourses(coursesRes.data);
        setQuizAttempts(quizAttemptsRes.data);
        setCourseCatalog(catalogRes.data);
        setAchievements(achievementsRes.data);
        setQuizzes(quizzesRes.data);
      } catch (loadError) {
        console.error('Failed to load profile data:', loadError);
        setError('We could not load your latest learning data.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const learningStats = useMemo(() => {
    const completedCourses = userCourses.filter((course) => course.completed).length;
    const averageProgress = userCourses.length
      ? Math.round(userCourses.reduce((total, course) => total + course.progress, 0) / userCourses.length)
      : 0;
    const passRate = quizAttempts.length
      ? Math.round((quizAttempts.filter((attempt) => attempt.passed).length / quizAttempts.length) * 100)
      : 0;

    return {
      completedCourses,
      averageProgress,
      passRate,
    };
  }, [quizAttempts, userCourses]);

  const recentCourses = userCourses.slice(0, 3);
  const quizRecords = quizAttempts;
  const certificateCount = achievements.filter((achievement) => achievement.kind === 'course_completion').length;

  const getQuizTitle = (quizId: string) => quizzes.find((quiz) => quiz.id === quizId)?.title || quizId;

  const handleDeleteQuizAttempt = async () => {
    if (!user || !pendingDeleteAttemptId) {
      return;
    }

    try {
      setDeletingAttempt(true);
      setRecordError('');
      setRecordSuccess('');
      await api.deleteUserQuizAttempt(user.id, pendingDeleteAttemptId);
      setQuizAttempts((current) => current.filter((attempt) => attempt.id !== pendingDeleteAttemptId));
      setRecordSuccess('Quiz record deleted.');
      setPendingDeleteAttemptId(null);
    } catch (deleteError: any) {
      setRecordError(deleteError.message || 'Could not delete that quiz record right now.');
    } finally {
      setDeletingAttempt(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setError('');
    setSuccess('');

    if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.email.trim()) {
      setError('Please complete your first name, last name, and email.');
      return;
    }

    try {
      setSaving(true);
      await updateUser({
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        email: editData.email.trim().toLowerCase(),
      });
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (saveError: any) {
      setError(saveError.message || 'Could not update your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-950">Please sign in</h1>
          <p className="mt-3 text-sm text-slate-600">Your profile, enrollments, and quiz history appear here after login.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'Instructor') {
    return <InstructorProfileView />;
  }

  if (user.role === 'Admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-slate-950">Admin accounts use a different workspace</h1>
          <p className="mt-3 text-sm text-slate-600">
            Admin operations live in the admin dashboard and account management screens, not the learner profile.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/dashboard" className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Open admin dashboard
            </Link>
            <Link href="/settings" className="inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Open account settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <ConfirmationDialog
        isOpen={Boolean(pendingDeleteAttemptId)}
        title="Delete quiz record?"
        description="This removes the selected quiz attempt from your record list and recalculates the visible stats on this page."
        confirmLabel="Delete record"
        tone="danger"
        busy={deletingAttempt}
        onCancel={() => setPendingDeleteAttemptId(null)}
        onConfirm={() => {
          void handleDeleteQuizAttempt();
        }}
      />
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white/90 px-8 py-8 shadow-2xl shadow-slate-200 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-950">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {user.role}
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {user.firstName} {user.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setEditing((current) => !current)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
            >
              {editing ? 'Cancel edit' : 'Edit profile'}
            </button>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Settings className="h-4 w-4" />
              Account settings
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Courses enrolled" value={userCourses.length} icon={<BookOpen className="h-5 w-5" />} />
              <StatCard label="Courses completed" value={learningStats.completedCourses} icon={<CheckCircle2 className="h-5 w-5" />} />
              <StatCard label="Certificates earned" value={certificateCount} icon={<Trophy className="h-5 w-5" />} />
            </div>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Profile details</h2>
                  <p className="mt-1 text-sm text-slate-600">Keep your account details accurate for communications and certificates.</p>
                </div>
              </div>

              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

              {editing ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field
                    label="First name"
                    value={editData.firstName}
                    onChange={(value) => setEditData((current) => ({ ...current, firstName: value }))}
                  />
                  <Field
                    label="Last name"
                    value={editData.lastName}
                    onChange={(value) => setEditData((current) => ({ ...current, lastName: value }))}
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Email address"
                      type="email"
                      value={editData.email}
                      onChange={(value) => setEditData((current) => ({ ...current, email: value }))}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditData({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                        });
                        setEditing(false);
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="mt-6 grid gap-4 md:grid-cols-2">
                  <Detail label="Full name" value={`${user.firstName} ${user.lastName}`} />
                  <Detail label="Role" value={user.role} />
                  <Detail label="Email" value={user.email} />
                  <Detail label="Last sign-in" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'No sign-in history yet'} />
                </dl>
              )}
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Current courses</h2>
                  <p className="mt-1 text-sm text-slate-600">Continue where you left off.</p>
                </div>
                <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                  Browse catalog
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading courses...</p>
                ) : recentCourses.length > 0 ? (
                  recentCourses.map((course) => {
                    const courseInfo = courseCatalog.find((item) => item.slug === course.courseSlug);
                    return (
                      <div key={course.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{courseInfo?.title || course.courseSlug}</h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {course.category} · {course.difficulty}
                            </p>
                          </div>
                          <div className="min-w-[160px]">
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                              <span>Progress</span>
                              <span className="font-semibold text-slate-900">{course.progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                              <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                    No enrollments yet. Pick a coding track from the catalog to get started.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Certificates & accolades</h2>
                  <p className="mt-1 text-sm text-slate-600">Completed milestones, earned certificates, and learning highlights from your journey.</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6">
                <AchievementShowcase achievements={achievements} />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Agent support</h2>
                  <p className="mt-1 text-sm text-slate-600">Open your approved learning and support agents whenever you need help.</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Bot className="h-5 w-5" />
                </div>
              </div>
              <Link href="/agents" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Open agent hub
              </Link>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Learning momentum</h2>
                <Award className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-6 grid gap-4">
                <MomentumRow label="Average course progress" value={`${learningStats.averageProgress}%`} />
                <MomentumRow label="Quiz attempts" value={quizAttempts.length} />
                <MomentumRow label="Completed courses" value={learningStats.completedCourses} />
                <MomentumRow label="Quiz pass rate" value={`${learningStats.passRate}%`} />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Quiz records</h2>
                  <p className="mt-1 text-sm text-slate-600">Keep or delete individual attempt records from your learner history.</p>
                </div>
              </div>

              {recordError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{recordError}</div> : null}
              {recordSuccess ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{recordSuccess}</div> : null}

              <div className="mt-6 space-y-3">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading attempts...</p>
                ) : quizRecords.length > 0 ? (
                  quizRecords.map((attempt) => {
                    const courseInfo = attempt.courseSlug ? courseCatalog.find((course) => course.slug === attempt.courseSlug) : null;
                    return (
                    <div key={attempt.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{getQuizTitle(attempt.quizId)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {courseInfo?.title || attempt.courseSlug || 'Standalone quiz'} · {new Date(attempt.attemptedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div className="text-right">
                        <p className={`font-semibold ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{attempt.score}%</p>
                        <p className="text-xs text-slate-500">{attempt.passed ? 'Passed' : 'Retry needed'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteAttemptId(attempt.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )})
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                    No quiz attempts yet. Your results will appear here after your first assessment.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-700">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function MomentumRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export default ProfilePage;
