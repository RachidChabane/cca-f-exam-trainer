import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/cn'

/** Renders a markdown string with the editorial `.prose-markdown` styles. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('prose-markdown', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
