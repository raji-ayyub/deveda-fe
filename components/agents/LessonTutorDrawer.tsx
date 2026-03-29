'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Bot, Clock3, LoaderCircle, MessageSquare, Plus, RefreshCw, Send, Sparkles, Trash2, X } from 'lucide-react';

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
  const [pendingUserMessage, setPendingUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState('');
  const [activityLabel, setActivityLabel] = useState('');
  const [error, setError] = useState('');
  const [threadPendingDelete, setThreadPendingDelete] = useState<AgentThread | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      void loadState();
    }
  }, [open, courseSlug, lessonSlug]);

  useEffect(() => {
    if (!open) {
      setShowThreadList(false);
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
    if (!mounted || typeof document === 'undefined') {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, open]);

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

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) {
      return;
    }

    composer.style.height = '0px';
    composer.style.height = `${Math.min(composer.scrollHeight, 220)}px`;
  }, [message]);

  useEffect(() => {
    if (!open) {
      return;
    }

    composerRef.current?.focus();

    const viewport = messagesViewportRef.current;
    if (!viewport) {
      return;
    }

    const behavior: ScrollBehavior = messages.length > 0 || pendingUserMessage || sending ? 'smooth' : 'auto';
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  }, [open, messages, pendingUserMessage, sending, threadId]);

  const loadState = async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      setPendingUserMessage('');
      const assignmentsRes = await api.getAgentAssignments();
      const tutorAssignments = assignmentsRes.data
        .filter((item) => item.agentType === 'lesson_tutor')
        .sort((left, right) => {
          const relevanceDelta = lessonTutorRelevance(right, courseSlug, lessonSlug) - lessonTutorRelevance(left, courseSlug, lessonSlug);
          if (relevanceDelta !== 0) {
            return relevanceDelta;
          }
          const statusDelta = lessonTutorStatusPriority(left.status) - lessonTutorStatusPriority(right.status);
          if (statusDelta !== 0) {
            return statusDelta;
          }
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        });
      const approved = tutorAssignments.find((item) => item.status === 'approved') || null;
      const currentAssignment = approved || tutorAssignments[0] || null;
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
      const existing = matchingThreads.find((thread) => thread.id === storedThreadId) || matchingThreads[0];

      const thread =
        existing ||
        (
          await api.createAgentThread({
            assignmentId: approved.id,
            title: `${courseTitle} - Nexa`,
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
      setError(loadError.message || 'Unable to load Nexa right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      await loadState({ silent: true });
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to request Nexa right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const outgoingMessage = message.trim();

    if (!threadId || !outgoingMessage) {
      return;
    }

    try {
      setSending(true);
      setActivityLabel(getLessonTutorActivityLabel(outgoingMessage));
      setError('');
      setPendingUserMessage(outgoingMessage);
      setMessage('');

      const response = await api.sendAgentMessage(threadId, {
        message: outgoingMessage,
        courseSlug,
        lessonSlug,
        lessonTitle,
        currentProgress,
      });

      setMessages((current) => [...current, response.data.userMessage, response.data.assistantMessage]);
      setThreads((current) => {
        const updatedThreads = current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                lastMessagePreview: response.data.assistantMessage.content.slice(0, 180),
                updatedAt: response.data.assistantMessage.createdAt,
              }
            : thread
        );

        return updatedThreads.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
      });
    } catch (sendError: any) {
      if (threadId) {
        await openThread(threadId);
      }
      setMessage(outgoingMessage);
      setError(sendError.message || 'Unable to send your message.');
    } finally {
      setSending(false);
      setActivityLabel('');
      setPendingUserMessage('');
    }
  };

  const openThread = async (nextThreadId: string) => {
    try {
      setLoading(true);
      setError('');
      setPendingUserMessage('');
      setShowThreadList(false);
      setThreadId(nextThreadId);
      const threadRes = await api.getAgentThread(nextThreadId);
      setMessages(threadRes.data.messages);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to open this Nexa chat right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadState({ silent: true });
  };

  const handleNewChat = async () => {
    if (!assignment || assignment.status !== 'approved') {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPendingUserMessage('');
      setShowThreadList(false);
      const response = await api.createAgentThread({
        assignmentId: assignment.id,
        title: `${courseTitle} - Nexa ${threads.length + 1}`,
        courseSlug,
        lessonSlug,
      });
      setThreads((current) => [response.data, ...current]);
      setThreadId(response.data.id);
      setMessages([]);
      setMessage('');
    } catch (createError: any) {
      setError(createError.message || 'Unable to start a new tutor chat.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!threadPendingDelete || !assignment || assignment.status !== 'approved') {
      return;
    }

    try {
      setDeletingThreadId(threadPendingDelete.id);
      setError('');
      await api.deleteAgentThread(threadPendingDelete.id);

      const remainingThreads = threads.filter((thread) => thread.id !== threadPendingDelete.id);
      setThreads(remainingThreads);

      if (remainingThreads.length > 0) {
        const nextThread = remainingThreads[0];
        setShowThreadList(false);
        setThreadId(nextThread.id);
        const threadRes = await api.getAgentThread(nextThread.id);
        setMessages(threadRes.data.messages);
      } else {
        const response = await api.createAgentThread({
          assignmentId: assignment.id,
          title: `${courseTitle} - Nexa`,
          courseSlug,
          lessonSlug,
        });
        setThreads([response.data]);
        setShowThreadList(false);
        setThreadId(response.data.id);
        setMessages([]);
      }

      setMessage('');
      setPendingUserMessage('');
    } catch (deleteError: any) {
      setError(deleteError.message || 'Unable to delete this chat right now.');
    } finally {
      setDeletingThreadId('');
      setThreadPendingDelete(null);
    }
  };

  const activeThread = threads.find((item) => item.id === threadId) || null;
  const progressLabel = typeof currentProgress === 'number' ? `${Math.round(currentProgress)}% course progress` : 'Lesson context attached';
  const hasConversation = messages.length > 0 || Boolean(pendingUserMessage) || sending;

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[80] bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <div
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[90] w-full max-w-[560px] transform-gpu border-l border-slate-800/80 bg-slate-950/95 text-white shadow-[0_0_80px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Personal tutor"
          className="relative flex h-full flex-col bg-gradient-to-b from-cyan-500/8 via-slate-950 to-slate-950"
        >
          <div className="border-b border-slate-800/80 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  <Bot className="h-3.5 w-3.5" />
                  Lesson Tutor
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-white">Nexa</h2>
                  <span className="text-xs text-slate-500">Personal tutor</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Ask for clearer explanations, examples, or a slower walkthrough without leaving the lesson.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close lesson tutor"
                className="rounded-2xl border border-slate-700 bg-white/[0.03] p-2.5 text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-800 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                <span className="truncate">{lessonTitle || courseTitle}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                <span>{progressLabel}</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mx-5 mt-4 rounded-[24px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {threadPendingDelete ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 px-5 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-[28px] border border-slate-800 bg-slate-950 p-6 shadow-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-100">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Delete this chat?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This removes the chat and its messages from your saved history. Use this when you want to free space for newer chats.
                </p>
                <div className="mt-5 rounded-[22px] border border-slate-800 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  {threadPendingDelete.title || 'Nexa chat'}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setThreadPendingDelete(null)}
                    disabled={Boolean(deletingThreadId)}
                    className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleDeleteThread()}
                    disabled={Boolean(deletingThreadId)}
                    className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
                  >
                    {deletingThreadId === threadPendingDelete.id ? 'Deleting...' : 'Delete chat'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="rounded-[28px] border border-slate-800 bg-white/[0.03] px-6 py-8 text-center">
                  <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-cyan-200" />
                  <p className="mt-4 text-sm text-slate-300">Loading Nexa...</p>
                </div>
              </div>
            ) : assignment?.status === 'approved' ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-slate-800/80 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Active chat</div>
                      <div className="mt-1 truncate text-sm font-medium text-white">{activeThread?.title || 'Nexa chat'}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {threads.length > 1 ? (
                        <button
                          onClick={() => setShowThreadList((current) => !current)}
                          disabled={loading || sending}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100 disabled:opacity-60"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {showThreadList ? 'Hide chats' : `Chats (${threads.length})`}
                        </button>
                      ) : null}
                      <button
                        onClick={handleNewChat}
                        disabled={loading || sending}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100 disabled:opacity-60"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New chat
                      </button>
                      <button
                        onClick={handleRefresh}
                        disabled={loading || sending || refreshing}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100 disabled:opacity-60"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      {activeThread ? (
                        <button
                          onClick={() => setThreadPendingDelete(activeThread)}
                          disabled={loading || sending || Boolean(deletingThreadId)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-500/15 disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingThreadId === activeThread.id ? 'Deleting...' : 'Delete chat'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {showThreadList ? (
                    <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                      {threads.map((thread) => {
                        const isActive = thread.id === threadId;

                        return (
                          <button
                            key={thread.id}
                            onClick={() => openThread(thread.id)}
                            disabled={loading || sending}
                            className={`block w-full rounded-[22px] border px-4 py-3 text-left transition ${
                              isActive
                                ? 'border-cyan-400/30 bg-cyan-500/12 text-cyan-50'
                                : 'border-slate-800 bg-white/[0.03] text-slate-200 hover:border-slate-600 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-sm font-semibold">{thread.title || 'Nexa chat'}</div>
                              <div className={`shrink-0 text-[11px] ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                                {isActive ? 'Open' : formatThreadTimestamp(thread.updatedAt)}
                              </div>
                            </div>
                            <div className={`mt-2 truncate text-xs ${isActive ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                              {thread.lastMessagePreview || 'No messages yet'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <div ref={messagesViewportRef} className="flex-1 overflow-y-auto px-4 py-4">
                  {hasConversation ? (
                    <div className="space-y-4">
                      {messages.map((item) => {
                        const isUser = item.role === 'user';

                        return (
                          <div key={item.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser ? (
                              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                                <Bot className="h-4 w-4" />
                              </div>
                            ) : null}
                            <div
                              className={`max-w-[88%] rounded-[26px] border px-4 py-3 shadow-sm ${
                                isUser
                                  ? 'border-blue-400/20 bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                  : 'border-slate-800 bg-white/[0.05] text-slate-100'
                              }`}
                            >
                              <div className={`mb-2 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] ${isUser ? 'text-blue-100/85' : 'text-slate-400'}`}>
                                <span>{isUser ? 'You' : 'Nexa'}</span>
                                <span>{formatMessageTime(item.createdAt)}</span>
                              </div>
                              <AgentMessageBody content={item.content} className="text-[15px]" />
                            </div>
                          </div>
                        );
                      })}

                      {pendingUserMessage ? (
                        <div className="flex justify-end gap-3">
                          <div className="max-w-[88%] rounded-[26px] border border-blue-400/20 bg-gradient-to-br from-blue-500/85 to-blue-600/85 px-4 py-3 text-white opacity-85 shadow-sm">
                            <div className="mb-2 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100/85">
                              <span>You</span>
                              <span>Sending...</span>
                            </div>
                            <AgentMessageBody content={pendingUserMessage} className="text-[15px]" />
                          </div>
                        </div>
                      ) : null}

                      {sending ? (
                        <div className="flex gap-3">
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="max-w-[88%] rounded-[26px] border border-slate-800 bg-white/[0.05] px-4 py-3 text-slate-100 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-cyan-200" />
                              Nexa is thinking
                            </div>
                            <p className="text-sm leading-6 text-slate-300">{activityLabel || 'Reviewing your message and the lesson context...'}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-700 bg-white/[0.03] px-5 py-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-white">This chat is ready</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Ask about this lesson and Nexa will answer with the current course and lesson context already attached.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800/80 bg-slate-950/90 px-4 py-4">
                  <div className="rounded-[24px] border border-slate-800 bg-white/[0.04] p-3">
                    <textarea
                      ref={composerRef}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                      disabled={sending}
                      rows={1}
                      placeholder={sending ? 'Nexa is working...' : 'Write your question here...'}
                      className="min-h-[56px] max-h-[220px] w-full resize-none overflow-y-auto rounded-[22px] border border-transparent bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:text-slate-500"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3 px-1">
                      <div className="text-xs text-slate-500">Press Ctrl+Enter to send</div>
                      <button
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? 'Working...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : assignment?.status === 'pending' ? (
              <div className="flex h-full items-center px-5 py-6">
                <div className="w-full rounded-[28px] border border-amber-500/25 bg-amber-500/10 p-6 text-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-100">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Nexa is waiting for approval</h3>
                      <p className="mt-1 text-sm text-amber-100/80">Your request is still pending. Refresh when you want to check again.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="mt-5 rounded-2xl border border-amber-300/30 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-500/10 disabled:opacity-60"
                  >
                    {refreshing ? 'Checking...' : 'Refresh status'}
                  </button>
                </div>
              </div>
            ) : assignment?.status === 'rejected' ? (
              <div className="flex h-full items-center px-5 py-6">
                <div className="w-full rounded-[28px] border border-rose-500/25 bg-rose-500/10 p-6 text-rose-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-100">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">This request was rejected</h3>
                      <p className="mt-1 text-sm text-rose-100/80">You can request access again or refresh if the status changes.</p>
                    </div>
                  </div>
                  {assignment.adminNotes ? <div className="mt-4 rounded-[22px] bg-black/20 px-4 py-3 text-sm">{assignment.adminNotes}</div> : null}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleRequest}
                      disabled={loading}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
                    >
                      Request again
                    </button>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="rounded-2xl border border-rose-300/30 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/10 disabled:opacity-60"
                    >
                      {refreshing ? 'Checking...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center px-5 py-6">
                <div className="w-full rounded-[28px] border border-slate-800 bg-white/[0.03] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">Enable Nexa</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Request access once, and this lesson chat will be ready whenever you want extra help during the course.
                  </p>
                  <button
                    onClick={handleRequest}
                    disabled={loading}
                    className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
                  >
                    Request Nexa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
    ,
    document.body
  );
}

function getLessonTutorActivityLabel(_message: string) {
  return 'Reviewing your message and the lesson context...';
}

function lessonTutorStatusPriority(status: AgentAssignment['status']) {
  if (status === 'approved') {
    return 0;
  }
  if (status === 'pending') {
    return 1;
  }
  return 2;
}

function lessonTutorRelevance(assignment: AgentAssignment, courseSlug: string, lessonSlug?: string) {
  let score = 0;
  if (assignment.courseSlug === courseSlug) {
    score += 2;
  }
  if ((assignment.lessonSlug || '') === (lessonSlug || '')) {
    score += 2;
  }
  if (!assignment.courseSlug) {
    score += 1;
  }
  if (!assignment.lessonSlug) {
    score += 1;
  }
  return score;
}

function formatMessageTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatThreadTimestamp(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
