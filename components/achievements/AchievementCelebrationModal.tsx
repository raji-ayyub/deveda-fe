'use client';

import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';

import { UserAchievement } from '@/lib/types';

const celebrationToneClasses: Record<
  string,
  {
    shell: string;
    badge: string;
    icon: string;
    accent: string;
    button: string;
  }
> = {
  amber: {
    shell: 'from-amber-50 via-white to-orange-50',
    badge: 'bg-amber-100 text-amber-900',
    icon: 'bg-amber-100 text-amber-700',
    accent: 'border-amber-200 bg-amber-50',
    button: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
  },
  emerald: {
    shell: 'from-emerald-50 via-white to-lime-50',
    badge: 'bg-emerald-100 text-emerald-900',
    icon: 'bg-emerald-100 text-emerald-700',
    accent: 'border-emerald-200 bg-emerald-50',
    button: 'bg-emerald-500 text-white hover:bg-emerald-400',
  },
  blue: {
    shell: 'from-blue-50 via-white to-cyan-50',
    badge: 'bg-blue-100 text-blue-900',
    icon: 'bg-blue-100 text-blue-700',
    accent: 'border-blue-200 bg-blue-50',
    button: 'bg-blue-600 text-white hover:bg-blue-500',
  },
};

export function AchievementCelebrationModal({
  achievements,
  learnerName,
  onClose,
}: {
  achievements: UserAchievement[];
  learnerName: string;
  onClose: () => void;
}) {
  if (achievements.length === 0) {
    return null;
  }

  const featured = achievements[0];
  const tone = celebrationToneClasses[featured.badgeTone] || celebrationToneClasses.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl overflow-hidden rounded-[36px] border border-slate-200 bg-gradient-to-br ${tone.shell} text-slate-950 shadow-[0_32px_120px_rgba(15,23,42,0.45)]`}>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 sm:p-10">
          <div className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
            <Sparkles className="h-5 w-5" />
            <span>Milestone unlocked</span>
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">{learnerName}, celebrate this win.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">{featured.celebrationMessage}</p>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{featured.badgeLabel}</p>
                <h3 className="mt-3 text-3xl font-black text-slate-950">{featured.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{featured.description}</p>
              </div>
              <div className={`rounded-2xl p-3 ${tone.icon}`}>
                <Award className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {featured.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {skill}
                </span>
              ))}
            </div>

            {featured.certificate && (
              <div className={`mt-6 rounded-[24px] border p-5 ${tone.accent}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{featured.certificate.label}</p>
                <p className="mt-2 font-mono text-sm font-semibold text-slate-950">{featured.certificate.code}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{featured.certificate.shareNote}</p>
              </div>
            )}
          </div>

          {achievements.length > 1 ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
              {achievements.length} milestones were unlocked in this moment. Showing the newest one first.
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${tone.button}`}
            >
              Keep learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
