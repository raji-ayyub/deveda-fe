'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';

import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';
import { AgentAssignment } from '@/lib/types';

export default function AdminAgentsPage() {
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotesById, setAdminNotesById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async (options?: { silent?: boolean }) => {
    try {
      setError('');
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.getAgentAssignments();
      const nextAssignments = [...response.data].sort((left, right) => {
        const statusDelta = approvalPriority(left.status) - approvalPriority(right.status);
        if (statusDelta !== 0) {
          return statusDelta;
        }
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      });
      setAssignments(nextAssignments);
      setAdminNotesById((current) => {
        const next = { ...current };
        for (const assignment of nextAssignments) {
          next[assignment.id] = current[assignment.id] ?? assignment.adminNotes ?? '';
        }
        return next;
      });
    } catch (loadError: any) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (assignmentId: string, status: 'approved' | 'rejected') => {
    try {
      setSavingId(assignmentId);
      setError('');
      await api.updateAgentRequest(assignmentId, {
        status,
        adminNotes: adminNotesById[assignmentId] || '',
      });
      await loadAssignments({ silent: true });
    } catch (updateError: any) {
      setError(getErrorMessage(updateError));
    } finally {
      setSavingId(null);
    }
  };

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') {
      return assignments;
    }
    return assignments.filter((assignment) => assignment.status === statusFilter);
  }, [assignments, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: assignments.length,
      pending: assignments.filter((assignment) => assignment.status === 'pending').length,
      approved: assignments.filter((assignment) => assignment.status === 'approved').length,
      rejected: assignments.filter((assignment) => assignment.status === 'rejected').length,
    }),
    [assignments]
  );

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
          <button
            onClick={() => loadAssignments({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setStatusFilter(statusKey)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                statusFilter === statusKey
                  ? 'bg-slate-950 text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {statusKey} {statusCounts[statusKey]}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
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
                    {assignment.approvedAt ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Last approval update {new Date(assignment.approvedAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  <div className="w-full max-w-xl space-y-3">
                    <textarea
                      value={adminNotesById[assignment.id] ?? ''}
                      onChange={(event) =>
                        setAdminNotesById((current) => ({
                          ...current,
                          [assignment.id]: event.target.value,
                        }))
                      }
                      placeholder="Add an approval note or a rejection reason."
                      className="min-h-[92px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateStatus(assignment.id, 'approved')}
                      disabled={savingId === assignment.id || assignment.status === 'approved'}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {assignment.status === 'approved' ? 'Approved' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateStatus(assignment.id, 'rejected')}
                      disabled={savingId === assignment.id || assignment.status === 'rejected'}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {assignment.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>
                  </div>
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

function approvalPriority(status: AgentAssignment['status']) {
  if (status === 'pending') {
    return 0;
  }
  if (status === 'approved') {
    return 1;
  }
  return 2;
}
