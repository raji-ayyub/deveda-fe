'use client';

import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';

import { api } from '@/lib/api';
import { AgentAssignment } from '@/lib/types';

export default function AdminAgentsPage() {
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.getAgentAssignments();
      setAssignments(response.data);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load agent approvals.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (assignmentId: string, status: 'approved' | 'rejected') => {
    try {
      setSavingId(assignmentId);
      setError('');
      await api.updateAgentRequest(assignmentId, { status });
      await loadAssignments();
    } catch (updateError: any) {
      setError(updateError.message || 'Unable to update request.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading agent approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_58%,#06b6d4_100%)] px-8 py-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Bot className="h-3.5 w-3.5" />
          Agent governance
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Approve or reject assistant access</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100/90">
          This is the control point for multi-agent availability across the platform. Keep the workflow deliberate and easy to audit.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Requests</h2>
            <p className="mt-1 text-sm text-slate-600">Pending requests should move quickly so the experience stays useful.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {assignments.length} total
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-[24px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-950">{assignment.displayName || assignment.agentType}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        assignment.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : assignment.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Requested for `{assignment.agentType}` {assignment.courseSlug ? `on ${assignment.courseSlug}` : ''} {assignment.lessonSlug ? `(${assignment.lessonSlug})` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {new Date(assignment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateStatus(assignment.id, 'approved')}
                      disabled={savingId === assignment.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(assignment.id, 'rejected')}
                      disabled={savingId === assignment.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No requests yet</h3>
              <p className="mt-2 text-sm text-slate-500">Agent requests from students and instructors will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
