import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/useT'
import type { QuizQuestion } from '@/types'

const LETTERS = ['A', 'B', 'C', 'D']

/** One interactive multiple-choice quiz card: pick an option, then see whether it
 * was right, why the correct answer is correct, and (if you missed) why your
 * choice is wrong. Controlled by the parent so a QuizList can show a live score. */
function QuizItem({
  item,
  number,
  total,
  selected,
  onSelect,
  onReset,
}: {
  item: QuizQuestion
  number: number
  total: number
  selected: number | null
  onSelect: (idx: number) => void
  onReset: () => void
}) {
  const t = useT()
  const lang = useLang()
  const revealed = selected !== null
  const isCorrect = selected === item.correct_index

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5" data-testid="quiz-item">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground tabular-nums">
          {t.checkOf(number, total)}
        </span>
        {revealed && (
          <Badge variant={isCorrect ? 'success' : 'destructive'} className="font-semibold">
            {isCorrect ? t.tagCorrect : t.tagIncorrect}
          </Badge>
        )}
      </div>
      <p className="mt-1.5 text-[15px] font-medium leading-snug text-foreground">{item.q[lang]}</p>

      <div className="mt-3 space-y-2" role="radiogroup" aria-label={item.q[lang]}>
        {item.options[lang].map((opt, idx) => {
          const isCorrectOpt = idx === item.correct_index
          const isChosen = idx === selected
          return (
            <button
              key={idx}
              role="radio"
              aria-checked={isChosen}
              disabled={revealed}
              onClick={() => onSelect(idx)}
              data-testid={`quiz-option-${idx}`}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-100',
                revealed
                  ? isCorrectOpt
                    ? 'border-success/60 bg-success/10'
                    : isChosen
                      ? 'border-destructive/60 bg-destructive/10'
                      : 'border-border opacity-70'
                  : 'border-border bg-card hover:border-border-strong hover:bg-surface-hover',
                revealed && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[12px] font-semibold',
                  revealed && isCorrectOpt
                    ? 'border-success bg-success text-success-foreground'
                    : revealed && isChosen
                      ? 'border-destructive bg-destructive text-destructive-foreground'
                      : 'border-border-strong text-muted-foreground',
                )}
              >
                {revealed && isCorrectOpt ? (
                  <Check className="h-3.5 w-3.5" />
                ) : revealed && isChosen ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  LETTERS[idx]
                )}
              </span>
              <span className="text-[14px] leading-relaxed text-foreground">{opt}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-3 space-y-2.5">
          <div className="rounded-md border border-success/30 bg-success/[0.07] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-success">{t.whyCorrect}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-foreground">{item.explanation[lang]}</p>
          </div>
          {!isCorrect && selected !== null && (
            <div className="rounded-md border border-destructive/30 bg-destructive/[0.07] px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                {t.yourAnswer}: {LETTERS[selected]}
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-foreground">
                {item.distractor_explanations[lang][selected]}
              </p>
            </div>
          )}
          <button
            onClick={onReset}
            data-testid="quiz-retry"
            className="text-[12.5px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
          >
            {t.quizTryAgain}
          </button>
        </div>
      )}
    </div>
  )
}

/** A set of quiz cards with a live score header. */
export function QuizList({ items, intro }: { items: QuizQuestion[]; intro?: string }) {
  const t = useT()
  const signature = items.map((q) => q.id).join('|')
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null))
  const [prevSignature, setPrevSignature] = useState(signature)

  // Reset the answers whenever the question set changes (theme/course switch).
  // We key off the question ids, not just the count, because most courses ship
  // the same number of questions, so a length check alone would let one course's
  // selections bleed into the next.
  if (signature !== prevSignature) {
    setPrevSignature(signature)
    setAnswers(items.map(() => null))
    return null
  }

  const answered = answers.filter((a) => a !== null).length
  const correct = answers.filter((a, i) => a === items[i].correct_index).length

  const set = (i: number, idx: number) =>
    setAnswers((prev) => prev.map((a, k) => (k === i ? idx : a)))
  const reset = (i: number) => setAnswers((prev) => prev.map((a, k) => (k === i ? null : a)))

  return (
    <div>
      {(intro || answered > 0) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {intro ? (
            <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">{intro}</p>
          ) : (
            <span />
          )}
          {answered > 0 && (
            <Badge variant="secondary" className="shrink-0 font-semibold tabular-nums" data-testid="quiz-score">
              {t.quizScore(correct, items.length)}
            </Badge>
          )}
        </div>
      )}
      <div className="space-y-3">
        {items.map((q, i) => (
          <QuizItem
            key={q.id}
            item={q}
            number={i + 1}
            total={items.length}
            selected={answers[i]}
            onSelect={(idx) => set(i, idx)}
            onReset={() => reset(i)}
          />
        ))}
      </div>
    </div>
  )
}
