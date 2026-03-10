'use client';

import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';

import { UserAchievement } from '@/lib/types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/20 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#f5d0fe_35%,#0f172a_100%)] text-white shadow-2xl shadow-slate-950/50">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full bg-white/10 p-2 transition hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3 text-amber-200">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.24em]">Milestone unlocked</span>
          </div>

          <h2 className="mt-4 text-4xl font-black tracking-tight">{learnerName}, celebrate this win.</h2>
          <p className="mt-3 max-w-xl text-sm text-white/80">{featured.celebrationMessage}</p>

          <div className="mt-8 rounded-[28px] border border-white/15 bg-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">{featured.badgeLabel}</p>
                <h3 className="mt-3 text-3xl font-black">{featured.title}</h3>
                <p className="mt-2 text-sm text-white/80">{featured.description}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-amber-200">
                <Award className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {featured.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {skill}
                </span>
              ))}
            </div>

            {featured.certificate && (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/30 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">{featured.certificate.label}</p>
                <p className="mt-2 font-mono text-sm">{featured.certificate.code}</p>
                <p className="mt-3 text-sm text-white/75">{featured.certificate.shareNote}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Keep learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
