'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, Gamepad2, Heart, RefreshCw, Sparkles, Trophy, WandSparkles, XCircle } from 'lucide-react';

import {
  ArrayLessonGame,
  AsyncLessonGame,
  getLessonGameDefinition,
  GridLessonGame,
  GridOptionPlacement,
  LessonGameDefinition,
  SemanticLessonGame,
  StatesLessonGame,
} from '@/lib/lesson-games';

interface LessonGameArcadeProps {
  lessonSlug?: string | null;
  onAskNexa?: () => void;
}

interface FeedbackState {
  correct: boolean;
  title: string;
  description: string;
}

const storageKey = (lessonSlug: string) => `deveda-lesson-game-best:${lessonSlug}`;

export default function LessonGameArcade({ lessonSlug, onAskNexa }: LessonGameArcadeProps) {
  const game = useMemo(() => getLessonGameDefinition(lessonSlug), [lessonSlug]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [asyncSequence, setAsyncSequence] = useState<string[]>([]);

  useEffect(() => {
    setRoundIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedChoice('');
    setAsyncSequence([]);
  }, [game?.lessonSlug]);

  useEffect(() => {
    if (typeof window === 'undefined' || !game) {
      return;
    }
    const stored = Number(window.localStorage.getItem(storageKey(game.lessonSlug)) || '0');
    setBestScore(Number.isFinite(stored) ? stored : 0);
  }, [game]);

  if (!game) {
    return null;
  }

  const rounds = game.rounds;
  const currentRound = rounds[roundIndex];
  const semanticRound = game.kind === 'semantic' ? (currentRound as SemanticLessonGame['rounds'][number]) : null;
  const gridRound = game.kind === 'grid' ? (currentRound as GridLessonGame['rounds'][number]) : null;
  const statesRound = game.kind === 'states' ? (currentRound as StatesLessonGame['rounds'][number]) : null;
  const arrayRound = game.kind === 'array' ? (currentRound as ArrayLessonGame['rounds'][number]) : null;
  const asyncRound = game.kind === 'async' ? (currentRound as AsyncLessonGame['rounds'][number]) : null;
  const isFinalRound = roundIndex === rounds.length - 1;
  const completed = Boolean(feedback && isFinalRound);
  const accuracy = rounds.length > 0 ? Math.round((score / rounds.length) * 100) : 0;
  const previewAccuracy = rounds.length > 0 ? Math.round(((score + (feedback?.correct ? 1 : 0)) / rounds.length) * 100) : 0;
  const answeredThisRound = feedback !== null;

  const correctLabel = getCorrectAnswerLabel(game, currentRound);
  const canSubmit =
    !answeredThisRound &&
    (game.kind === 'async'
      ? asyncSequence.length === (asyncRound?.answer.length || 0)
      : selectedChoice.trim().length > 0);

  const resetGame = () => {
    setRoundIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedChoice('');
    setAsyncSequence([]);
  };

  const persistBestScore = (nextScore: number) => {
    if (typeof window === 'undefined') {
      return;
    }
    const nextBest = Math.max(bestScore, nextScore);
    setBestScore(nextBest);
    window.localStorage.setItem(storageKey(game.lessonSlug), String(nextBest));
  };

  const submitRound = () => {
    if (answeredThisRound) {
      return;
    }

    const isCorrect =
      game.kind === 'async'
        ? arraysEqual(asyncSequence, asyncRound?.answer || [])
        : selectedChoice === getRoundAnswer(game, currentRound);

    const nextScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) {
      setScore(nextScore);
    }

    setFeedback({
      correct: isCorrect,
      title: isCorrect ? currentRound.celebration : `Almost there. The clearest answer was ${correctLabel}.`,
      description: currentRound.insight,
    });

    if (isFinalRound) {
      persistBestScore(nextScore);
    }
  };

  const moveNext = () => {
    if (!feedback) {
      return;
    }

    if (isFinalRound) {
      resetGame();
      return;
    }

    setRoundIndex((current) => current + 1);
    setFeedback(null);
    setSelectedChoice('');
    setAsyncSequence([]);
  };

  const appendAsyncStep = (step: string) => {
    if (feedback || game.kind !== 'async') {
      return;
    }
    if (asyncSequence.length >= currentRound.answer.length) {
      return;
    }
    setAsyncSequence((current) => [...current, step]);
  };

  const removeAsyncStep = (indexToRemove: number) => {
    if (feedback || game.kind !== 'async') {
      return;
    }
    setAsyncSequence((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const asyncStepPool =
    asyncRound
      ? asyncRound.availableSteps.filter((step) => {
          const usedCount = asyncSequence.filter((item) => item === step).length;
          const maxCount = asyncRound.availableSteps.filter((item) => item === step).length;
          return usedCount < maxCount;
        })
      : [];

  return (
    <section className={`overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 ${game.palette.glow}`}>
      <div
        className={`relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]`}
      >
        <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-r ${game.palette.from} ${game.palette.via} ${game.palette.to}`} />
        <div className="relative grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-100">
              <Gamepad2 className="h-4 w-4 text-cyan-300" />
              {game.arcadeLabel}
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white">{game.title}</h3>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-300">{game.subtitle}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{game.story}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <StatCard label="Round" value={`${roundIndex + 1}/${rounds.length}`} accent="text-cyan-200" />
              <StatCard label="Score" value={`${score}/${rounds.length}`} accent="text-emerald-200" />
              <StatCard label="Best" value={`${bestScore}/${rounds.length}`} accent="text-amber-200" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Studio vibe</div>
                <div className="mt-2 text-2xl font-bold text-white">{feedback?.correct ? previewAccuracy : accuracy}% mastery</div>
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${game.palette.chip}`}>
                {game.lessonTitle}
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-white/10">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${game.palette.from.replace('/25', '')} ${game.palette.to.replace('/20', '')} transition-all duration-500`}
                style={{ width: `${Math.max(feedback?.correct ? previewAccuracy : accuracy, 8)}%` }}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniNote icon={<Heart className="h-4 w-4 text-pink-300" />} title="Designed for confidence" text="Fast wins, friendly feedback, and real lesson skill-building." />
              <MiniNote icon={<WandSparkles className="h-4 w-4 text-amber-300" />} title="Real frontend payoff" text="Each answer reinforces a decision the learner will actually make in code." />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-5">
          {game.kind === 'semantic' ? (
            <SemanticRoundView
              game={game}
              round={semanticRound!}
              selectedChoice={selectedChoice}
              disabled={answeredThisRound}
              onSelect={setSelectedChoice}
            />
          ) : null}

          {game.kind === 'grid' ? (
            <GridRoundView
              game={game}
              round={gridRound!}
              selectedChoice={selectedChoice}
              disabled={answeredThisRound}
              onSelect={setSelectedChoice}
            />
          ) : null}

          {game.kind === 'states' ? (
            <StatesRoundView
              game={game}
              round={statesRound!}
              selectedChoice={selectedChoice}
              disabled={answeredThisRound}
              onSelect={setSelectedChoice}
            />
          ) : null}

          {game.kind === 'array' ? (
            <ArrayRoundView
              game={game}
              round={arrayRound!}
              selectedChoice={selectedChoice}
              disabled={answeredThisRound}
              onSelect={setSelectedChoice}
            />
          ) : null}

          {game.kind === 'async' ? (
            <AsyncRoundView
              game={game}
              round={asyncRound!}
              disabled={answeredThisRound}
              sequence={asyncSequence}
              stepPool={asyncStepPool}
              onAppend={appendAsyncStep}
              onRemove={removeAsyncStep}
              onReset={() => setAsyncSequence([])}
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={submitRound}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {feedback?.correct ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              Check my move
            </button>

            <button
              onClick={moveNext}
              disabled={!feedback}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {completed ? <RefreshCw className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
              {completed ? 'Replay arcade' : 'Next round'}
            </button>

            <button
              onClick={resetGame}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Reset run
            </button>
          </div>

          {feedback ? (
            <div
              className={`rounded-[28px] border px-5 py-5 ${
                feedback.correct ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50' : 'border-rose-400/30 bg-rose-400/10 text-rose-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.correct ? <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" /> : <XCircle className="mt-1 h-5 w-5 text-rose-300" />}
                <div>
                  <div className="text-lg font-bold">{feedback.title}</div>
                  <p className="mt-2 text-sm leading-6 opacity-95">{feedback.description}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Reward path</div>
            <div className="mt-3 text-2xl font-bold text-white">{game.rewardTitle}</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{game.rewardDescription}</p>

            <div className="mt-5 space-y-3">
              {rounds.map((_, index) => {
                const isCurrent = index === roundIndex;
                const isCleared = index < roundIndex || (index === roundIndex && Boolean(feedback?.correct));
                return (
                  <div
                    key={`${game.lessonSlug}-checkpoint-${index}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                      isCurrent
                        ? 'border-cyan-300/30 bg-cyan-400/10'
                        : isCleared
                        ? 'border-emerald-300/25 bg-emerald-400/10'
                        : 'border-white/10 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">Checkpoint {index + 1}</div>
                      <div className="text-xs text-slate-400">{isCurrent ? 'Live now' : isCleared ? 'Cleared' : 'Coming up'}</div>
                    </div>
                    {isCleared ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Sparkles className="h-4 w-4 text-slate-500" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5">
            <div className="flex items-center gap-2 text-cyan-200">
              <Bot className="h-4 w-4" />
              <div className="text-xs font-semibold uppercase tracking-[0.22em]">Need backup?</div>
            </div>
            <div className="mt-3 text-lg font-bold text-white">Talk it through with Nexa</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              If a round feels tricky, open Nexa and ask for a calmer explanation, a fresh example, or why the correct choice fits the lesson.
            </p>
            {onAskNexa ? (
              <button
                onClick={onAskNexa}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <Bot className="h-4 w-4" />
                Open Nexa
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function MiniNote({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function SemanticRoundView({
  game,
  round,
  selectedChoice,
  disabled,
  onSelect,
}: {
  game: SemanticLessonGame;
  round: SemanticLessonGame['rounds'][number];
  selectedChoice: string;
  disabled: boolean;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <RoundIntro eyebrow={game.arcadeLabel} title={round.prompt} context={round.context} />
      <div className="mt-5 grid gap-3">
        {round.choices.map((choice) => (
          <ChoiceCard
            key={choice.label}
            selected={selectedChoice === choice.label}
            disabled={disabled}
            title={choice.label}
            description={choice.description}
            onClick={() => onSelect(choice.label)}
          />
        ))}
      </div>
    </div>
  );
}

function GridRoundView({
  game,
  round,
  selectedChoice,
  disabled,
  onSelect,
}: {
  game: GridLessonGame;
  round: GridLessonGame['rounds'][number];
  selectedChoice: string;
  disabled: boolean;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <RoundIntro eyebrow={game.arcadeLabel} title={round.prompt} context={round.context} />
      <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">{round.hint}</div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {round.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={`rounded-[24px] border p-4 text-left transition ${
              selectedChoice === option.id
                ? 'border-cyan-300/40 bg-cyan-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="text-sm font-semibold text-white">{option.label}</div>
            <div className="mt-1 text-sm leading-6 text-slate-400">{option.note}</div>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-[#071120] p-3">
              <GridPreview placements={option.placements} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatesRoundView({
  game,
  round,
  selectedChoice,
  disabled,
  onSelect,
}: {
  game: StatesLessonGame;
  round: StatesLessonGame['rounds'][number];
  selectedChoice: string;
  disabled: boolean;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <RoundIntro eyebrow={round.targetState} title={round.scenario} context={round.context} />
      <div className="mt-5 grid gap-3">
        {round.options.map((option) => (
          <ChoiceCard
            key={option.id}
            selected={selectedChoice === option.id}
            disabled={disabled}
            title={option.label}
            description={option.styleNote}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ArrayRoundView({
  game,
  round,
  selectedChoice,
  disabled,
  onSelect,
}: {
  game: ArrayLessonGame;
  round: ArrayLessonGame['rounds'][number];
  selectedChoice: string;
  disabled: boolean;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <RoundIntro eyebrow={game.arcadeLabel} title={round.prompt} context="Study the raw input and the exact UI-ready target, then choose the smartest transformation." />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <DataTray title="Input data" items={round.input} tone="border-amber-300/20 bg-amber-400/10 text-amber-50" />
        <DataTray title="Target output" items={round.target} tone="border-emerald-300/20 bg-emerald-400/10 text-emerald-50" />
      </div>
      <div className="mt-5 grid gap-3">
        {round.options.map((option) => (
          <ChoiceCard
            key={option.id}
            selected={selectedChoice === option.id}
            disabled={disabled}
            title={option.label}
            description={option.explanation}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AsyncRoundView({
  game,
  round,
  disabled,
  sequence,
  stepPool,
  onAppend,
  onRemove,
  onReset,
}: {
  game: AsyncLessonGame;
  round: AsyncLessonGame['rounds'][number];
  disabled: boolean;
  sequence: string[];
  stepPool: string[];
  onAppend: (step: string) => void;
  onRemove: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
      <RoundIntro eyebrow={game.arcadeLabel} title={round.scenario} context={round.goal} />
      <div className="mt-5 rounded-[24px] border border-white/10 bg-[#06111f] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Build the state sequence</div>
          <button onClick={onReset} disabled={disabled || sequence.length === 0} className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
            Reset
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Array.from({ length: round.answer.length }).map((_, index) => {
            const step = sequence[index];
            return (
              <button
                key={`${game.lessonSlug}-sequence-slot-${index}`}
                type="button"
                disabled={disabled || !step}
                onClick={() => step && onRemove(index)}
                className={`min-h-[88px] rounded-2xl border px-4 py-3 text-left ${
                  step ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-50' : 'border-dashed border-white/10 bg-white/5 text-slate-500'
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">{`Step ${index + 1}`}</div>
                <div className="mt-2 text-sm font-semibold">{step || 'Tap a state card below'}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-white">Available state cards</div>
        <div className="mt-3 flex flex-wrap gap-3">
          {stepPool.map((step, index) => (
            <button
              key={`${step}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onAppend(step)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
            >
              {step}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoundIntro({ eyebrow, title, context }: { eyebrow: string; title: string; context: string }) {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</div>
      <h4 className="mt-2 text-2xl font-bold text-white">{title}</h4>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{context}</p>
    </>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-[24px] border p-4 text-left transition ${
        selected ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{description}</div>
    </button>
  );
}

function DataTray({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className={`rounded-[24px] border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function GridPreview({ placements }: { placements: GridOptionPlacement[] }) {
  const columns = Math.max(...placements.map((placement) => placement.col + (placement.colSpan || 1) - 1));
  const rows = Math.max(...placements.map((placement) => placement.row + (placement.rowSpan || 1) - 1));

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(64px, 1fr))`,
      }}
    >
      {placements.map((placement) => (
        <div
          key={`${placement.label}-${placement.row}-${placement.col}`}
          className={`rounded-2xl px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-950 ${placement.tone}`}
          style={{
            gridColumn: `${placement.col} / span ${placement.colSpan || 1}`,
            gridRow: `${placement.row} / span ${placement.rowSpan || 1}`,
          }}
        >
          {placement.label}
        </div>
      ))}
    </div>
  );
}

function getRoundAnswer(game: LessonGameDefinition, round: LessonGameDefinition['rounds'][number]) {
  return round.answer;
}

function getCorrectAnswerLabel(game: LessonGameDefinition, round: LessonGameDefinition['rounds'][number]) {
  if (game.kind === 'async') {
    return (round as AsyncLessonGame['rounds'][number]).answer.join(' -> ');
  }

  if (game.kind === 'semantic') {
    return (round as SemanticLessonGame['rounds'][number]).answer;
  }

  if (game.kind === 'grid' || game.kind === 'states' || game.kind === 'array') {
    const typedRound = round as GridLessonGame['rounds'][number] | StatesLessonGame['rounds'][number] | ArrayLessonGame['rounds'][number];
    const matched = typedRound.options.find((option) => option.id === typedRound.answer);
    return matched?.label || typedRound.answer;
  }

  return '';
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((item, index) => item === right[index]);
}
