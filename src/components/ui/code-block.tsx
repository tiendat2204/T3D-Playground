'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  showCopy?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  showCopy = true,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const [highlightedCode, setHighlightedCode] = React.useState<string>('')
  const codeRef = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    async function highlight() {
      try {
        const { codeToHtml } = await import('shiki')
        const html = await codeToHtml(code, {
          lang: language,
          theme: 'github-dark'
        })
        setHighlightedCode(html)
      } catch {
        setHighlightedCode('')
      }
    }
    highlight()
  }, [code, language])

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const lines = code.split('\n')

  return (
    <div className={cn('relative rounded-none border bg-gray-950 text-gray-100 overflow-hidden', className)}>
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
          <span className="text-xs text-gray-400 font-mono">{filename}</span>
        </div>
      )}
      <div className="relative">
        {showCopy && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-gray-400 hover:text-gray-100"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
        {highlightedCode ? (
          <div
            className="overflow-x-auto p-4 text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre ref={codeRef} className="overflow-x-auto p-4 text-sm">
            <code>
              {showLineNumbers ? (
                <table className="border-collapse">
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={i}>
                        <td className="pr-4 text-right text-gray-600 select-none w-[3rem]">{i + 1}</td>
                        <td className="whitespace-pre">{line || ' '}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <span className="whitespace-pre">{code}</span>
              )}
            </code>
          </pre>
        )}
      </div>
    </div>
  )
}
