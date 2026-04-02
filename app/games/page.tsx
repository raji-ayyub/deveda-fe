'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Gamepad2, Loader2, Sparkles, Star, Trophy } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getLessonGameDefinition, LESSON_GAME_OPTIONS } from '@/lib/lesson-games';
import { CourseCatalog, CourseCurriculum, LessonGameProgress, UserCourse } from '@/lib/types';

type GameLessonEntry = {
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonSummary: string;
  moduleTitle: string;
  durationMinutes: number;
  gameKey: string;
  enrolled: boolean;
  progress: LessonGameProgress | null;
};

function statusLabel(progress: LessonGameProgress | null) {
  if (!progress) {
    return 'New challenge';
  }
  if (progress.status === 'mastered') {
    return 'Mastered';
  }
  if (progress.status === 'completed') {
    return 'Completed';
  }
  if (progress.status === 'in_progress') {
    return 'In progress';
  }
  return 'Ready to play';
}

export default function GamesPage() {
  const { user } = useAuth();
  const isLearner = user?.role === 'Student';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<GameLessonEntry[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);

  useEffect(() => {
    const loadGamesHub = async () => {
      try {
        setLoading(true);
        setError('');

        const [catalogResponse, learnerCoursesResponse] = await Promise.all([
          api.getCourseCatalog({ category: 'Frontend Development', pageSize: 24 }),
          isLearner && user ? api.getUserCourses(user.id) : Promise.resolve({ data: [] as UserCourse[] }),
        ]);

        const catalogCourses = catalogResponse.data || [];
        const learnerCourses = learnerCoursesResponse.data || [];
        const enrolledMap = new Map(learnerCourses.map((course) => [course.courseSlug, course]));
        setUserCourses(learnerCourses);

        const curriculaResults = await Promise.all(
          catalogCourses.map(async (course) => {
            try {
              const curriculumResponse = await api.getCourseCurriculum(course.slug);
              return { course, curriculum: curriculumResponse.data };
            } catch {
              return null;
            }
          })
        );

        const discoveredEntries = curriculaResults
          .filter((result): result is { course: CourseCatalog; curriculum: CourseCurriculum } => Boolean(result?.curriculum))
          .flatMap(({ course, curriculum }) =>
            curriculum.modules.flatMap((module) =>
              module.lessons
                .filter((lesson) => lesson.gameKey && getLessonGameDefinition(lesson.gameKey))
                .map((lesson) => ({
                  courseSlug: course.slug,
                  courseTitle: course.title,
                  lessonSlug: lesson.slug,
                  lessonTitle: lesson.title,
                  lessonSummary: lesson.summary,
                  moduleTitle: module.title,
                  durationMinutes: lesson.durationMinutes,
                  gameKey: lesson.gameKey || '',
                  enrolled: enrolledMap.has(course.slug),
                  progress: null,
                }))
            )
          );

        if (!discoveredEntries.length) {
          setEntries([]);
          return;
        }

        const progressResults = await Promise.all(
          discoveredEntries.map(async (entry) => {
            if (!isLearner || !user || !entry.enrolled) {
              return null;
            }

            try {
              const progressResponse = await api.getLessonGameProgress(user.id, entry.courseSlug, entry.lessonSlug);
              return {
                key: `${entry.courseSlug}::${entry.lessonSlug}`,
                progress: progressResponse.data,
              };
            } catch {
              return null;
            }
          })
        );

        const progressMap = new Map(
          progressResults
            .filter((item): item is { key: string; progress: LessonGameProgress } => Boolean(item?.progress))
            .map((item) => [item.key, item.progress])
        );

        setEntries(
          discoveredEntries
            .map((entry) => ({
              ...entry,
              progress: progressMap.get(`${entry.courseSlug}::${entry.lessonSlug}`) || null,
            }))
            .sort((left, right) => {
              if (left.enrolled !== right.enrolled) {
                return left.enrolled ? -1 : 1;
              }
              return (right.progress?.bestScore || 0) - (left.progress?.bestScore || 0);
            })
        );
      } catch (loadError: any) {
        setError(loadError.message || 'Unable to load lesson games right now.');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    void loadGamesHub();
  }, [isLearner, user]);

  const enrolledEntries = useMemo(() => entries.filter((entry) => entry.enrolled), [entries]);
  const masteredCount = useMemo(
    () => entries.filter((entry) => entry.progress?.status === 'mastered').length,
    [entries]
  );
  const featuredEntry = enrolledEntries.find((entry) => entry.progress?.status === 'in_progress') || enrolledEntries[0] || entries[0] || null;
  const enrolledCourseCount = useMemo(() => new Set(userCourses.map((course) => course.courseSlug)).size, [userCourses]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_18%,#111827_52%,#eef2ff_100%)]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.14),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.12),transparent_22%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Lesson games hub
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                Play the challenge layer, not just the lesson text.
              </h1>
              <p className="mt-5 max-w-3xl text-lg text-slate-200">
                Every game here is tied to a real lesson and drops straight into the exact course challenge. No scavenger hunt, no hidden extras, just a visible arcade path for the skills learners are building.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Lesson-linked gameplay</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Progress-aware challenge cards</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Direct jump into the lesson arcade</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-2xl">
                  Browse courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {!user ? (
                  <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    Sign in to track scores
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <HubStat label="Live challenges" value={String(entries.length || LESSON_GAME_OPTIONS.length)} />
                <HubStat label="Courses with games" value={String(new Set(entries.map((entry) => entry.courseSlug)).size || 1)} />
                <HubStat label="Mastered" value={String(masteredCount)} />
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/35 p-5">
                <div className="flex items-start gap-3">
                  <Gamepad2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">How the flow works now</div>
                    <p className="mt-2 text-sm text-slate-300">
                      Open a game card, jump directly into the matching lesson, and land on the game section instead of digging through the course manually.
                    </p>
                  </div>
                </div>
              </div>
              {isLearner ? (
                <div className="mt-4 rounded-[24px] border border-emerald-400/15 bg-emerald-400/10 p-5 text-sm text-emerald-50">
                  {enrolledCourseCount > 0
                    ? `You currently have access to ${enrolledCourseCount} enrolled course${enrolledCourseCount === 1 ? '' : 's'} from this hub.`
                    : 'Enroll in a course to unlock direct play and persistent challenge progress.'}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-8 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <section className="rounded-[30px] border border-white/10 bg-slate-950/40 px-6 py-16 text-center text-slate-200 shadow-2xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-300" />
            <p className="mt-4 text-sm">Loading the current lesson game arcade...</p>
          </section>
        ) : null}

        {!loading && featuredEntry ? (
          <section className="mb-8 rounded-[30px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,47,73,0.95),rgba(30,41,59,0.96),rgba(88,28,135,0.92))] p-6 text-white shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Featured jump-in</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight">{featuredEntry.lessonTitle}</h2>
                <p className="mt-3 max-w-3xl text-sm text-slate-200">{featuredEntry.lessonSummary}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-200">
                  <span className="rounded-full bg-white/10 px-3 py-1.5">{featuredEntry.courseTitle}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5">{featuredEntry.moduleTitle}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5">{statusLabel(featuredEntry.progress)}</span>
                </div>
              </div>
              <Link
                href={
                  featuredEntry.enrolled
                    ? `/courses/${featuredEntry.courseSlug}/learn?lesson=${featuredEntry.lessonSlug}&focus=game`
                    : `/courses/${featuredEntry.courseSlug}`
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                {featuredEntry.enrolled ? 'Play this challenge' : 'Open course'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : null}

        {!loading ? (
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Challenge arcade</div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Choose a game and jump straight in</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                  These cards are the missing front door to the game layer. Pick one, then we route you into the exact lesson challenge instead of burying it deep in the course.
                </p>
              </div>
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                See all courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {entries.length > 0 ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => {
                  const game = getLessonGameDefinition(entry.gameKey);
                  if (!game) {
                    return null;
                  }

                  const actionHref = entry.enrolled
                    ? `/courses/${entry.courseSlug}/learn?lesson=${entry.lessonSlug}&focus=game`
                    : `/courses/${entry.courseSlug}`;

                  return (
                    <article key={`${entry.courseSlug}-${entry.lessonSlug}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <div className={`border-b border-slate-200 bg-gradient-to-br ${game.palette.from} ${game.palette.via} ${game.palette.to} p-5`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/5 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                              <Gamepad2 className="h-3.5 w-3.5" />
                              {game.arcadeLabel}
                            </div>
                            <h3 className="mt-4 text-xl font-black text-slate-950">{game.title}</h3>
                            <p className="mt-2 text-sm text-slate-700">{game.subtitle}</p>
                          </div>
                          <div className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${entry.progress?.status === 'mastered' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white/80 text-slate-600'}`}>
                            {statusLabel(entry.progress)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-5">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{entry.courseTitle}</div>
                          <div className="mt-2 text-lg font-bold text-slate-950">{entry.lessonTitle}</div>
                          <p className="mt-2 text-sm text-slate-600">{entry.lessonSummary}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <MiniMeta label="Module" value={entry.moduleTitle} />
                          <MiniMeta label="Duration" value={`${entry.durationMinutes} min`} />
                          <MiniMeta label="Best score" value={entry.progress ? `${entry.progress.bestScore}%` : 'No score yet'} />
                          <MiniMeta label="Rounds" value={entry.progress ? `${entry.progress.completedRounds}/${entry.progress.totalRounds || game.rounds.length}` : String(game.rounds.length)} />
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                          <span className="text-slate-500">
                            {entry.enrolled ? 'Unlocked from your course path' : 'Open the course to unlock this challenge'}
                          </span>
                          {entry.progress?.status === 'mastered' ? <Trophy className="h-4 w-4 text-amber-500" /> : <Star className="h-4 w-4 text-cyan-600" />}
                        </div>

                        <Link
                          href={actionHref}
                          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            entry.enrolled
                              ? 'bg-slate-950 text-white hover:bg-blue-700'
                              : 'border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700'
                          }`}
                        >
                          {entry.enrolled ? 'Play challenge' : 'Open course'}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                No published lesson games were found yet. Once a course ships with game-linked lessons, they will show here automatically.
              </div>
            )}
          </section>
        ) : null}

        {!loading ? (
          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            <FlowCard
              title="1. Pick a challenge"
              body="Start from a dedicated games hub instead of guessing which lessons hide a mini-game."
            />
            <FlowCard
              title="2. Jump into the lesson"
              body="Each card routes into the exact lesson and lands on the game section so the challenge feels native."
            />
            <FlowCard
              title="3. Keep learning in context"
              body="After the game, the full lesson, practice prompt, playground, and tutor are all right there."
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function HubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function FlowCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 text-white shadow-xl">
      <div className="text-lg font-black tracking-tight">{title}</div>
      <p className="mt-3 text-sm text-slate-300">{body}</p>
    </div>
  );
}
