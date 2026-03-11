'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Settings, Sparkles } from 'lucide-react';

export default function InstructorSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_60%,#06b6d4_100%)] p-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Instructor settings
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Teaching controls</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
          Keep your teaching tools separated from admin governance. Manage your profile publicly, and use this area for instructor workflows.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 w-fit">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">Account settings</h2>
          <p className="mt-2 text-sm text-slate-600">Update your photo, email, and password from the shared account settings page.</p>
          <Link href="/settings" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Open account settings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 w-fit">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">Curriculum workflow</h2>
          <p className="mt-2 text-sm text-slate-600">Go straight to the curriculum studio to keep modules and milestone projects aligned.</p>
          <Link href="/instructor/dashboard/cms" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Open curriculum studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
