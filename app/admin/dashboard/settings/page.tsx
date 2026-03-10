'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, UserCog } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e40af_60%,#22c55e_100%)] p-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
          <Sparkles className="h-3.5 w-3.5" />
          Admin Settings
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Operational controls</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">
          Keep launch-critical account and curriculum controls centralized. Public users manage their own account settings from the main app.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 w-fit">
            <UserCog className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">Account governance</h2>
          <p className="mt-2 text-sm text-slate-600">
            Roles and activation status are controlled through the user management screen to prevent accidental privilege escalation.
          </p>
          <Link
            href="/admin/dashboard/users"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open user management
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 w-fit">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">Curriculum integrity</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use the curriculum studio to keep modules, lesson quizzes, and milestone projects aligned before launch.
          </p>
          <Link
            href="/admin/dashboard/cms"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open curriculum studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
