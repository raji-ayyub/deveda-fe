'use client';

import React from 'react';
import { Award, GraduationCap, Sparkles, Trophy } from 'lucide-react';

import { UserAchievement } from '@/lib/types';

const toneClasses: Record<string, string> = {
  amber: 'from-amber-300 via-yellow-200 to-orange-100 text-amber-950',
  emerald: 'from-emerald-300 via-lime-200 to-white text-emerald-950',
  blue: 'from-blue-300 via-cyan-200 to-white text-blue-950',
};

export function AchievementShowcase({ achievements }: { achievements: UserAchievement[] }) {
  if (achievements.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Milestones and certificates will appear here as the learner completes lessons, quizzes, and projects.
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {achievements.map((achievement) => {
        const isCertificate = achievement.kind === 'course_completion' && achievement.certificate;
        return (
          <article
            key={achievement.id}
            className={`overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br ${toneClasses[achievement.badgeTone] || toneClasses.blue} shadow-xl shadow-slate-200`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{achievement.badgeLabel}</p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight">{achievement.title}</h3>
                  <p className="mt-2 text-sm opacity-80">{achievement.description}</p>
                </div>
                <div className="rounded-2xl bg-white/60 p-3">
                  {isCertificate ? <GraduationCap className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Course" value={achievement.courseTitle} />
                <Metric label="Unlocked at" value={`${achievement.progressTrigger}%`} />
              </div>

              <div className="mt-5 rounded-[24px] border border-white/60 bg-white/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  What this learner can now do
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {achievement.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm opacity-80">{achievement.parentSummary}</p>
              </div>

              {achievement.certificate && (
                <div className="mt-5 rounded-[24px] border border-slate-950/10 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Award className="h-4 w-4" />
                    {achievement.certificate.label}
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] opacity-60">Code</p>
                  <p className="mt-1 font-mono text-sm">{achievement.certificate.code}</p>
                  <p className="mt-3 text-sm opacity-80">{achievement.certificate.shareNote}</p>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] opacity-60">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
