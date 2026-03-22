import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Layers3, Server } from 'lucide-react';

import { teamMembers } from '@/lib/data';

const focusAreas = [
  {
    title: 'Frontend learning',
    description: 'Build confidence with HTML, CSS, JavaScript, React, and interface thinking that grows into real product work.',
    icon: Code2,
  },
  {
    title: 'Backend systems',
    description: 'Move from Python and APIs into service structure, data flow, and the habits behind dependable backend delivery.',
    icon: Server,
  },
  {
    title: 'Connected architecture',
    description: 'Understand how frontend and backend decisions meet in systems design, tradeoffs, and engineering communication.',
    icon: Layers3,
  },
];

export default function AboutPage() {
  const featuredMembers = teamMembers.slice(0, 6);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#eef2ff_100%)]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#38bdf833_0%,transparent_32%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_50%,#7c3aed_100%)] text-white">
        <div className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5" />
              About Deveda
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              A coding learning platform built around clarity, practice, and steady progress.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-100/90">
              Deveda is designed to help learners, instructors, and admins work from the same real course system, with clear paths, guided delivery, and progress that stays tied to actual activity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:shadow-2xl">
                Browse courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/lessons" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Explore lessons
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {focusAreas.map((area) => {
            const Icon = area.icon;
            return (
              <article key={area.title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">{area.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{area.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">How we think</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">The goal is simple: make the next step obvious.</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Deveda keeps the learning experience centered on practical software skills, not filler content. Courses are meant to move from explanation into action, with lessons, quizzes, and milestones reinforcing each other.
              </p>
              <p>
                Instructors shape curriculum through a guided content workflow, while learners see only the courses and lessons that are actually live. That keeps the public experience cleaner and the classroom experience easier to trust.
              </p>
              <p>
                The product is built to support real delivery: course creation, curriculum structure, access control, lesson flow, and progress tracking all point back to the same source of truth.
              </p>
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl shadow-slate-300">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">What matters here</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight">A smaller set of promises, done well.</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                Frontend, backend, and systems design stay connected instead of feeling like separate worlds.
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                Learners see real course progress, not decorative engagement counters.
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                Instructors and admins work from role-aware spaces built for publishing and delivery.
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Learning cohort</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">People and paths that reflect the coding journey</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                These profiles represent the mix of learner growth, mentoring, and collaborative practice the platform is built to support.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{featuredMembers.length} featured profiles</div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredMembers.map((member) => (
              <article key={member.name} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_55%,#8b5cf6_100%)] text-lg font-bold text-white">
                    {member.name
                      .split(' ')
                      .map((chunk) => chunk[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-blue-700">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{member.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.skills.slice(0, 4).map((skill) => (
                    <span key={`${member.name}-${skill}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
