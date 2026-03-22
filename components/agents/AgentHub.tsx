'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquare,
  Route,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AgentArtifact, AgentAssignment, AgentMessage, AgentTemplate, AgentThread } from '@/lib/types';
import AgentMessageBody from '@/components/agents/AgentMessageBody';
import { COURSE_CATEGORIES, COURSE_DIFFICULTIES } from '@/lib/course-content';

const SESSION_ASSIGNMENT_KEY = 'deveda_agent_assignment';
const SESSION_THREAD_KEY = 'deveda_agent_thread';

export default function AgentHub() {
  const { user, loading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState<AgentTemplate[]>([]);
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [activityLabel, setActivityLabel] = useState('');
  const [requestingAgent, setRequestingAgent] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [courseDraftTitle, setCourseDraftTitle] = useState('');
  const [courseDraftCategory, setCourseDraftCategory] = useState('Frontend Development');
  const [courseDraftDifficulty, setCourseDraftDifficulty] = useState('Beginner');

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      loadHub();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (selectedAssignmentId) {
      sessionStorage.setItem(SESSION_ASSIGNMENT_KEY, selectedAssignmentId);
    } else {
      sessionStorage.removeItem(SESSION_ASSIGNMENT_KEY);
    }

    if (selectedThreadId) {
      sessionStorage.setItem(SESSION_THREAD_KEY, selectedThreadId);
    } else {
      sessionStorage.removeItem(SESSION_THREAD_KEY);
    }
  }, [selectedAssignmentId, selectedThreadId]);

  const loadHub = async () => {
    try {
      setLoading(true);
      const [catalogRes, assignmentsRes, threadsRes] = await Promise.all([
        api.getAgentCatalog(),
        api.getAgentAssignments(),
        api.getAgentThreads(),
      ]);

      setCatalog(catalogRes.data);
      setAssignments(assignmentsRes.data);
      setThreads(threadsRes.data);
      if (assignmentsRes.data.length > 0) {
        const artifactsRes = await api.getAgentArtifacts();
        setArtifacts(artifactsRes.data);
      } else {
        setArtifacts([]);
      }

      const storedAssignmentId = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_ASSIGNMENT_KEY) || '' : '';
      const storedThreadId = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_THREAD_KEY) || '' : '';
      const approvedAssignments = assignmentsRes.data.filter((item) => item.status === 'approved');
      const preferredAssignment =
        approvedAssignments.find((item) => item.id === storedAssignmentId) ||
        approvedAssignments[0] ||
        null;

      if (preferredAssignment) {
        setSelectedAssignmentId(preferredAssignment.id);
        const preferredThread =
          threadsRes.data.find(
            (thread) => thread.id === storedThreadId && thread.assignmentId === preferredAssignment.id
          ) ||
          threadsRes.data.find((thread) => thread.assignmentId === preferredAssignment.id);
        if (preferredThread) {
          await openThread(preferredThread.id);
        } else {
          setSelectedThreadId('');
          setMessages([]);
        }
      }
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load agent workspace.');
    } finally {
      setLoading(false);
    }
  };

  const assignmentByType = useMemo(() => {
    return new Map(assignments.map((assignment) => [assignment.agentType, assignment]));
  }, [assignments]);

  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId) || null;
  const selectedArtifacts = selectedAssignment ? artifacts.filter((artifact) => artifact.assignmentId === selectedAssignment.id) : [];
  const latestCourseShell = selectedArtifacts.find((artifact) => artifact.artifactType === 'course_shell') || null;
  const latestCurriculumDraft = selectedArtifacts.find((artifact) => artifact.artifactType === 'curriculum_draft') || null;
  const latestCourseGeneration = selectedArtifacts.find((artifact) => artifact.artifactType === 'course_content_generation') || null;
  const draftCourseSlug =
    typeof latestCurriculumDraft?.payload?.courseSlug === 'string' ? latestCurriculumDraft.payload.courseSlug : undefined;
  const generatedCourseSlug =
    typeof latestCourseGeneration?.payload?.courseSlug === 'string' ? latestCourseGeneration.payload.courseSlug : undefined;
  const createdCourseSlug =
    typeof latestCourseShell?.payload?.courseSlug === 'string' ? latestCourseShell.payload.courseSlug : undefined;
  const availableCourseSlug =
    selectedAssignment?.courseSlug || createdCourseSlug || generatedCourseSlug || draftCourseSlug || undefined;
  const canCreateCurriculumDraft = Boolean(availableCourseSlug);
  const canApplyCurriculum = Boolean(availableCourseSlug);
  const visibleThreads = selectedAssignment ? threads.filter((thread) => thread.assignmentId === selectedAssignment.id) : threads;

  const openThread = async (threadId: string) => {
    try {
      setSelectedThreadId(threadId);
      const selectedThread = threads.find((thread) => thread.id === threadId);
      if (selectedThread) {
        setSelectedAssignmentId(selectedThread.assignmentId);
      }
      const response = await api.getAgentThread(threadId);
      setMessages(response.data.messages);
    } catch (threadError: any) {
      setError(threadError.message || 'Unable to open this thread.');
    }
  };

  const handleRequest = async (agentType: string) => {
    try {
      setRequestingAgent(agentType);
      setError('');
      await api.requestAgent({ agentType });
      await loadHub();
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to request this agent.');
    } finally {
      setRequestingAgent(null);
    }
  };

  const ensureThread = async (assignment: AgentAssignment) => {
    const existing = threads.find((thread) => thread.assignmentId === assignment.id);
    if (existing) {
      await openThread(existing.id);
      return existing.id;
    }

    const response = await api.createAgentThread({
      assignmentId: assignment.id,
      title: assignment.displayName || undefined,
    });
    const nextThreads = [response.data, ...threads];
    setThreads(nextThreads);
    setSelectedThreadId(response.data.id);
    setMessages([]);
    return response.data.id;
  };

  const handleOpenChat = async (assignment: AgentAssignment) => {
    setSelectedAssignmentId(assignment.id);
    try {
      const threadId = await ensureThread(assignment);
      await openThread(threadId);
    } catch (threadError: any) {
      setError(threadError.message || 'Unable to start chat.');
    }
  };

  const handleCreateNewChat = async () => {
    if (!selectedAssignment || selectedAssignment.status !== 'approved') {
      return;
    }

    try {
      setCreatingThread(true);
      setError('');
      const response = await api.createAgentThread({
        assignmentId: selectedAssignment.id,
        title: `${selectedAssignment.displayName || selectedAssignment.agentType} ${visibleThreads.length + 1}`,
        courseSlug: selectedAssignment.courseSlug || undefined,
        lessonSlug: selectedAssignment.lessonSlug || undefined,
      });
      setThreads((current) => [response.data, ...current]);
      setSelectedThreadId(response.data.id);
      setMessages([]);
    } catch (threadError: any) {
      setError(threadError.message || 'Unable to start a new chat.');
    } finally {
      setCreatingThread(false);
    }
  };

  const handleSend = async () => {
    if (!selectedAssignment || !message.trim()) {
      return;
    }

    try {
      setSending(true);
      setActivityLabel(getChatActivityLabel(selectedAssignment.agentType, message));
      setError('');
      const threadId = selectedThreadId || (await ensureThread(selectedAssignment));
      const response = await api.sendAgentMessage(threadId, { message: message.trim() });
      setMessages((current) => [...current, response.data.userMessage, response.data.assistantMessage]);
      const newArtifacts = ((response.data.assistantMessage.metadata?.artifacts as AgentArtifact[] | undefined) || []);
      if (newArtifacts.length > 0) {
        setArtifacts((current) => [...newArtifacts, ...current]);
      }
      setMessage('');
    } catch (sendError: any) {
      setError(sendError.message || 'Unable to send your message.');
    } finally {
      setSending(false);
      setActivityLabel('');
    }
  };

  const handleAgentAction = async (
    actionType: 'create_course_shell' | 'create_curriculum_draft' | 'apply_curriculum_to_course' | 'save_planning_note'
  ) => {
    if (!selectedAssignment) {
      return;
    }

    try {
      setSending(true);
      setActivityLabel(
        actionType === 'create_course_shell'
          ? 'Creating a new course shell and scaffolded curriculum workspace on the platform...'
          : actionType === 'create_curriculum_draft'
          ? 'Creating a structured curriculum draft from the current course context...'
          : actionType === 'apply_curriculum_to_course'
          ? 'Applying curriculum changes to the live course and syncing course totals...'
          : 'Reviewing learner progress and saving a planning note...'
      );
      setError('');
      const response = await api.runAgentAction(selectedAssignment.id, {
        actionType,
        artifactId:
          actionType === 'apply_curriculum_to_course'
            ? latestCurriculumDraft?.id || latestCourseGeneration?.id
            : undefined,
        courseSlug: availableCourseSlug,
        lessonSlug: selectedAssignment.lessonSlug || undefined,
        targetUserId: selectedAssignment.targetUserId || undefined,
        instruction:
          actionType === 'create_course_shell'
            ? `Create a new ${courseDraftCategory} ${courseDraftDifficulty} course called "${courseDraftTitle}".`
            : actionType === 'create_curriculum_draft'
            ? 'Create a practical curriculum draft grounded in the existing platform course.'
            : actionType === 'apply_curriculum_to_course'
            ? 'Apply the approved curriculum structure to the live platform course.'
            : 'Save a concise lesson-planning note grounded in the learner progress signals.',
      });
      setArtifacts((current) => {
        const next = [response.data, ...current];
        if (actionType === 'apply_curriculum_to_course' && latestCurriculumDraft) {
          return next.map((artifact) =>
            artifact.id === latestCurriculumDraft.id ? { ...artifact, status: 'applied' } : artifact
          );
        }
        return next;
      });
      if (actionType === 'create_course_shell') {
        setCourseDraftTitle('');
      }
    } catch (actionError: any) {
      setError(actionError.message || 'Unable to run this agent action.');
    } finally {
      setSending(false);
      setActivityLabel('');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading agent workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-slate-950">Sign in first</h1>
        <p className="mt-3 text-sm text-slate-600">The agent workspace is available after authentication.</p>
      </div>
    );
  }

  if (user.role === 'Admin') {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-slate-950">Admins use the approval board</h1>
        <p className="mt-3 text-sm text-slate-600">Agent requests and approvals live in the admin dashboard.</p>
        <Link href="/admin/dashboard/agents" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
          Open admin approvals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#06b6d4_100%)] px-8 py-8 text-white shadow-2xl shadow-slate-300">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          <Sparkles className="h-3.5 w-3.5" />
          Agent workspace
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Role-aware helpers without a noisy interface</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100/90">
          Request the right agent, wait for admin approval, then keep the chat focused on teaching, planning, navigation, or lesson support.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_1.3fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Available agents</h2>
              <p className="mt-1 text-sm text-slate-600">Request only what you actually need.</p>
            </div>
            <Bot className="h-5 w-5 text-blue-700" />
          </div>

          <div className="mt-6 space-y-4">
            {catalog.map((agent) => {
              const currentAssignment = assignmentByType.get(agent.key);
              return (
                <div key={agent.key} className="rounded-[24px] border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{agent.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{agent.description}</p>
                    </div>
                    <StatusBadge status={currentAssignment?.status || 'none'} />
                  </div>
                  <div className="mt-4">
                    {currentAssignment ? (
                      currentAssignment.status === 'approved' ? (
                        <button
                          onClick={() => handleOpenChat(currentAssignment)}
                          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Open chat
                        </button>
                      ) : (
                        <div className="text-sm text-slate-500">
                          {currentAssignment.status === 'pending' ? 'Waiting for admin approval.' : 'Request was rejected. You can request again later.'}
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => handleRequest(agent.key)}
                        disabled={requestingAgent === agent.key}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                      >
                        {requestingAgent === agent.key ? 'Requesting...' : 'Request agent'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Assignments</h2>
              <p className="mt-1 text-sm text-slate-600">Track approvals and jump back into approved chats.</p>
            </div>
            <Clock3 className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-6 space-y-3">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => {
                    setSelectedAssignmentId(assignment.id);
                    if (assignment.status === 'approved') {
                      handleOpenChat(assignment);
                    }
                  }}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    selectedAssignmentId === assignment.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{assignment.displayName || assignment.agentType}</div>
                      <div className="mt-1 text-xs text-slate-500">{assignment.agentType.replace(/_/g, ' ')}</div>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
                No agent requests yet.
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Conversation history</h3>
              <p className="mt-1 text-sm text-slate-600">Reopen earlier agent sessions from this browser session or any saved thread.</p>
            </div>

            <div className="mt-4 space-y-3">
              {visibleThreads.length > 0 ? (
                visibleThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => openThread(thread.id)}
                    className={`w-full rounded-[20px] border px-4 py-3 text-left transition ${
                      selectedThreadId === thread.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-950">{thread.title || 'Agent chat'}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {thread.lastMessagePreview || 'No messages yet.'}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                  No saved chats for this assignment yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Chat</h2>
              <p className="mt-1 text-sm text-slate-600">Keep questions focused so the agent stays useful.</p>
            </div>
            <MessageSquare className="h-5 w-5 text-blue-700" />
          </div>

          {selectedAssignment?.status === 'approved' ? (
            <>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleCreateNewChat}
                  disabled={sending || creatingThread}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                >
                  {creatingThread ? 'Starting...' : 'New chat'}
                </button>
                {selectedAssignment.agentType === 'course_builder' && (
                  <>
                    {!selectedAssignment.courseSlug && !createdCourseSlug && (
                      <div className="grid w-full gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                        <input
                          value={courseDraftTitle}
                          onChange={(event) => setCourseDraftTitle(event.target.value)}
                          disabled={sending}
                          placeholder='New course title'
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                        <select
                          value={courseDraftCategory}
                          onChange={(event) => setCourseDraftCategory(event.target.value)}
                          disabled={sending}
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                        >
                          {COURSE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <select
                          value={courseDraftDifficulty}
                          onChange={(event) => setCourseDraftDifficulty(event.target.value)}
                          disabled={sending}
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                        >
                          {COURSE_DIFFICULTIES.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAgentAction('create_course_shell')}
                          disabled={sending || !courseDraftTitle.trim()}
                          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          Create course
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleAgentAction('create_curriculum_draft')}
                      disabled={sending || !canCreateCurriculumDraft}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                    >
                      Create curriculum draft
                    </button>
                    <button
                      onClick={() => handleAgentAction('apply_curriculum_to_course')}
                      disabled={sending || !canApplyCurriculum}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {latestCurriculumDraft
                        ? 'Apply latest draft'
                        : latestCourseGeneration
                        ? 'Apply generated outline'
                        : 'Generate and apply'}
                    </button>
                  </>
                )}
                {selectedAssignment.agentType === 'progress_analyst' && (
                  <button
                    onClick={() => handleAgentAction('save_planning_note')}
                    disabled={sending}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                  >
                    Save planning note
                  </button>
                )}
              </div>

              <div className="mt-6 h-[420px] space-y-3 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                {sending && activityLabel ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Agent activity
                    </div>
                    <p className="mt-2 text-sm text-blue-800">{activityLabel}</p>
                  </div>
                ) : null}
                {messages.length > 0 ? (
                  messages.map((item) => {
                    const route = typeof item.metadata?.route === 'string' ? item.metadata.route : '';
                    const routeLabel =
                      typeof item.metadata?.routeLabel === 'string' ? item.metadata.routeLabel : 'Open route';

                    return (
                      <div
                        key={item.id}
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                          item.role === 'user'
                            ? 'ml-auto bg-slate-950 text-white'
                            : 'bg-white text-slate-800 shadow-sm'
                        }`}
                      >
                        <AgentMessageBody content={item.content} />
                        {item.role === 'assistant' && route ? (
                          <Link
                            href={route}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Route className="h-3.5 w-3.5" />
                            {routeLabel}
                          </Link>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                    Open an approved assignment to start the conversation.
                  </div>
                )}
                {sending ? (
                  <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <LoaderCircle className="h-4 w-4 animate-spin text-blue-700" />
                      Working on it
                    </div>
                    <p className="mt-2 text-slate-600">{activityLabel || 'Preparing the next response...'}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex gap-3">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={sending}
                  placeholder={sending ? 'Agent is working...' : 'Ask the agent for help...'}
                  className="min-h-[88px] flex-1 rounded-[24px] border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="inline-flex h-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Working...' : 'Send'}
                </button>
              </div>

              {selectedArtifacts.length > 0 && (
                <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileText className="h-4 w-4" />
                    Generated outputs
                  </div>
                  <div className="mt-3 space-y-3">
                    {selectedArtifacts.slice(0, 3).map((artifact) => (
                      <div key={artifact.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold text-slate-950">{artifact.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{artifact.summary}</div>
                        {artifact.route && (
                          <Link href={artifact.route} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                            Open related workspace
                            <Route className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 px-6 py-10 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No approved agent selected</h3>
              <p className="mt-2 text-sm text-slate-500">Request an agent or wait for approval before chat becomes active.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }

  if (status === 'pending') {
    return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>;
  }

  if (status === 'rejected') {
    return <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Rejected</span>;
  }

  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Not requested</span>;
}

function getChatActivityLabel(agentType: string, message: string) {
  const normalizedMessage = message.toLowerCase();

  if (agentType === 'course_builder') {
    if (normalizedMessage.includes('summary') || normalizedMessage.includes('effective') || normalizedMessage.includes('opinion')) {
      return 'Scanning the real course and summarizing what is already on the platform...';
    }

    if (
      normalizedMessage.includes('module')
      || normalizedMessage.includes('improve')
      || normalizedMessage.includes('carry on')
      || normalizedMessage.includes('go ahead')
    ) {
      return 'Reviewing the course structure and preparing a concrete expansion plan...';
    }

    return 'Scanning the course and shaping an instructor-ready response...';
  }

  if (agentType === 'progress_analyst') {
    return 'Reviewing learner progress, quiz signals, and planning next-lesson guidance...';
  }

  if (agentType === 'platform_support') {
    return 'Scanning the current platform areas and finding the best route for this task...';
  }

  return 'Reviewing lesson context and preparing a clear explanation...';
}
