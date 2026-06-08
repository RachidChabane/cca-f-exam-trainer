import { useExamStore } from '@/store/examStore'
import { ExamIntro } from '@/components/exam/ExamIntro'
import { ExamRunner } from '@/components/exam/ExamRunner'
import { ExamResults } from '@/components/exam/ExamResults'
import { ExamReview } from '@/components/exam/ExamReview'

export function ExamView() {
  const phase = useExamStore((s) => s.phase)
  if (phase === 'active') return <ExamRunner />
  if (phase === 'results') return <ExamResults />
  if (phase === 'review') return <ExamReview />
  return <ExamIntro />
}
