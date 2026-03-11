'use client';

import { useEffect, useState } from 'react';
import { Bot, LoaderCircle, MessageSquare, Send, X } from 'lucide-react';

import { api } from '@/lib/api';
import { AgentAssignment, AgentMessage, AgentThread } from '@/lib/types';
import AgentMessageBody from '@/components/agents/AgentMessageBody';

const lessonTutorSessionKey = (courseSlug: string, lessonSlug?: string) =>
  `deveda_lesson_tutor_thread:${courseSlug}:${lessonSlug || 'course'}`;

interface LessonTutorDrawerProps {
  open: boolean;
  onClose: () => void;
  courseSlug: string;
  courseTitle: string;
  lessonSlug?: string;
  lessonTitle?: string;
  currentProgress?: number;
}

export default function LessonTutorDrawer({
  open,
  onClose,
  courseSlug,
  courseTitle,
  lessonSlug,
  lessonTitle,
  currentProgress,
}: LessonTutorDrawerProps) {
  const [assignment, setAssignment] = useState<AgentAssignment | null>(null);
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [threadId, setThreadId] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activityLabel, setActivityLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadState();
    }
  }, [open, courseSlug, lessonSlug]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const key = lessonTutorSessionKey(courseSlug, lessonSlug);
    if (threadId) {
      sessionStorage.setItem(key, threadId);
    } else {
      sessionStorage.removeItem(key);
    }
  }, [courseSlug, lessonSlug, threadId]);

  const loadState = async () => {
    try {
      setLoading(true);
      setError('');
      const assignmentsRes = await api.getAgentAssignments();
      const approved = assignmentsRes.data.find(
        (item) => item.agentType === 'lesson_tutor' && item.status === 'approved'
      ) || null;
      const pending = assignmentsRes.data.find(
        (item) => item.agentType === 'lesson_tutor' && item.status === 'pending'
      ) || null;
      const currentAssignment = approved || pending || null;
      setAssignment(currentAssignment);

      if (!approved) {
        setThreads([]);
        setMessages([]);
        setThreadId('');
        return;
      }

      const threadsRes = await api.getAgentThreads(approved.id);
      const matchingThreads = threadsRes.data.filter(
        (thread) => thread.context?.courseSlug === courseSlug && thread.context?.lessonSlug === lessonSlug
      );
      setThreads(matchingThreads);

      const storedThreadId =
        typeof window !== 'undefined' ? sessionStorage.getItem(lessonTutorSessionKey(courseSlug, lessonSlug)) || '' : '';
      const existing = matchingThreads.find((thread) => thread.id === storedThreadId) || matchingThreads[0] || threadsRes.data.find(
        (thread) => thread.context?.courseSlug === courseSlug && thread.context?.lessonSlug === lessonSlug
      ) || threadsRes.data[0];

      const thread =
        existing ||
        (
          await api.createAgentThread({
            assignmentId: approved.id,
            title: `${courseTitle} Tutor`,
            courseSlug,
            lessonSlug,
          })
        ).data;

      setThreadId(thread.id);
      setThreads((current) => {
        if (current.some((item) => item.id === thread.id)) {
          return current;
        }
        return [thread, ...current];
      });
      const threadRes = await api.getAgentThread(thread.id);
      setMessages(threadRes.data.messages);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load lesson tutor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.requestAgent({
        agentType: 'lesson_tutor',
        courseSlug,
        lessonSlug,
      });
      setAssignment(response.data);
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to request the lesson tutor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!threadId || !message.trim()) {
      return;
    }

    try {
      setSending(true);
      setActivityLabel(getLessonTutorActivityLabel(message));
      setError('');
      const response = await api.sendAgentMessage(threadId, {
        message: message.trim(),
        courseSlug,
        lessonSlug,
        lessonTitle,
        currentProgress,
      });
      setMessages((current) => [...current, response.data.userMessage, response.data.assistantMessage]);
      setMessage('');
    } catch (sendError: any) {
      setError(sendError.message || 'Unable to send your message.');
    } finally {
      setSending(false);
      setActivityLabel('');
    }
  };

  const openThread = async (nextThreadId: string) => {
    try {
      setLoading(true);
      setError('');
      setThreadId(nextThreadId);
      const threadRes = await api.getAgentThread(nextThreadId);
      setMessages(threadRes.data.messages);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to open this lesson tutor thread.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!assignment || assignment.status !== 'approved') {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.createAgentThread({
        assignmentId: assignment.id,
        title: `${courseTitle} Tutor ${threads.length + 1}`,
        courseSlug,
        lessonSlug,
      });
      setThreads((current) => [response.data, ...current]);
      setThreadId(response.data.id);
      setMessages([]);
    } catch (createError: any) {
      setError(createError.message || 'Unable to start a new tutor chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <Bot className="h-3.5 w-3.5" />
              Lesson tutor
            </div>
            <h2 className="mt-3 text-xl font-bold">{courseTitle}</h2>
            <p className="mt-1 text-sm text-slate-300">{lessonTitle || 'Current lesson support'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && <div className="mx-5 mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading tutor...</div>
          ) : assignment?.status === 'approved' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleNewChat}
                  disabled={loading || sending}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100 disabled:opacity-60"
                >
                  New chat
                </button>
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => openThread(thread.id)}
                    disabled={loading || sending}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      thread.id === threadId
                        ? 'bg-cyan-500/20 text-cyan-100'
                        : 'border border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {thread.title || 'Tutor chat'}
                  </button>
                ))}
              </div>
              {sending && activityLabel ? (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">
                  <div className="flex items-center gap-2 font-semibold">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Tutor activity
                  </div>
                  <p className="mt-2 text-cyan-100/90">{activityLabel}</p>
                </div>
              ) : null}
              {messages.length > 0 ? (
                messages.map((item) => (
                  <div
                    key={item.id}
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                      item.role === 'user'
                        ? 'ml-auto bg-blue-600 text-white'
                        : 'bg-white/10 text-slate-100'
                    }`}
                  >
                    <AgentMessageBody content={item.content} />
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-700 px-5 py-8 text-center text-sm text-slate-400">
                  Ask for an explanation, an analogy, or a worked example from this lesson.
                </div>
              )}
              {sending ? (
                <div className="max-w-[90%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                  <div className="flex items-center gap-2 font-semibold">
                    <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" />
                    Working on it
                  </div>
                  <p className="mt-2 text-slate-300">{activityLabel || 'Preparing the explanation...'}</p>
                </div>
              ) : null}
            </div>
          ) : assignment?.status === 'pending' ? (
            <div className="rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-6 text-sm text-amber-100">
              Your lesson tutor request is pending admin approval.
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-700 px-5 py-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-500" />
              <h3 className="mt-4 text-lg font-semibold">Enable lesson tutor</h3>
              <p className="mt-2 text-sm text-slate-400">
                Request the tutor once, and when admin approves it you can turn this side chat on any time during lessons.
              </p>
              <button
                onClick={handleRequest}
                className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                Request lesson tutor
              </button>
            </div>
          )}
        </div>

        {assignment?.status === 'approved' && (
          <div className="border-t border-slate-800 px-5 py-4">
            <div className="flex gap-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={sending}
                placeholder={sending ? 'Tutor is working...' : 'Ask the tutor to explain this lesson...'}
                className="min-h-[88px] flex-1 rounded-[24px] border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="inline-flex h-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Working...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function getLessonTutorActivityLabel(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('example') || normalizedMessage.includes('show me')) {
    return 'Reviewing the lesson and preparing a worked example...';
  }

  if (normalizedMessage.includes('explain') || normalizedMessage.includes('why')) {
    return 'Preparing a simpler explanation with teaching context from this lesson...';
  }

  return 'Reviewing the lesson context and preparing tutor guidance...';
}
