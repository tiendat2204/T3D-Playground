'use client'

import { ArrowRight, Bot, Check, ChevronDown, Paperclip, Sparkles, Loader2, FolderKanban } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjects, useProjectEnvironments } from '@/hooks/use-projects'
import { aiService, type TestPlan } from '@/services/ai.service'
import { toast } from 'sonner'

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return
      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }
      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) textarea.style.height = `${minHeight}px`
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const GEMINI_ICON = (
  <svg height="1em" className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Gemini</title>
    <defs>
      <linearGradient id="gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
        <stop offset="0%" stopColor="#1C7DFF" />
        <stop offset="52.021%" stopColor="#1C69FF" />
        <stop offset="100%" stopColor="#F0DCD6" />
      </linearGradient>
    </defs>
    <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#gemini-fill)" fillRule="nonzero" />
  </svg>
)

interface Message {
  role: 'user' | 'assistant'
  content: string
  testPlan?: TestPlan
}

export function ChatAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [value, setValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Flash')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 72, maxHeight: 300 })
  const { data: projects } = useProjects()
  const { data: environments } = useProjectEnvironments(selectedProjectId)

  const projectsList = (projects || []) as { id: string; name: string; baseUrl: string }[]
  const environmentsList = (environments || []) as { id: string; name: string; baseUrl: string }[]
  const selectedProject = projectsList.find(p => p.id === selectedProjectId)

  const AI_MODELS = ['Gemini 2.5 Flash', 'Gemini 2.5 Pro']

  const MODEL_ICONS: Record<string, React.ReactNode> = {
    'Gemini 2.5 Flash': GEMINI_ICON,
    'Gemini 2.5 Pro': GEMINI_ICON,
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!value.trim() || isGenerating) return
    if (!selectedProjectId) {
      toast.error('Please select a project first')
      return
    }

    const userMessage = value.trim()
    setValue('')
    adjustHeight(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)

    try {
      const result = await aiService.generatePlan({
        projectId: selectedProjectId,
        url: selectedProject?.baseUrl || '',
        goal: userMessage,
        role: undefined
      })

      if (result) {
        const suiteCount = result.testSuites.length
        const caseCount = result.testSuites.reduce((acc, s) => acc + s.cases.length, 0)
        const assistantMessage = `Test plan generated with ${suiteCount} suites and ${caseCount} test cases.\n\n${result.testSuites.map(s => `**${s.name}**\n${s.cases.map(c => `• ${c.title}`).join('\n')}`).join('\n\n')}`
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, testPlan: result }])
        toast.success('Test plan generated!')
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to generate test plan. The AI service may be temporarily unavailable. Please try again in a few minutes.' }])
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('429')
      const userMessage = isQuotaError
        ? 'AI API quota exceeded. Please wait a few minutes and try again, or upgrade your API plan.'
        : 'An error occurred. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: userMessage }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Selector */}
      <div className="p-4 border-b flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Project:</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-none">
              {selectedProject ? (
                <span className="flex items-center gap-2">
                  {selectedProject.name}
                  <ChevronDown className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-gray-500">Select a project</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-none">
            {projectsList.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => setSelectedProjectId(p.id)}>
                {p.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedProject && (
          <span className="text-xs text-gray-400">{selectedProject.baseUrl}</span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">AI Test Agent</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {selectedProject
                ? `Describe what you want to test on ${selectedProject.name}, and I'll generate a Playwright test plan.`
                : 'Select a project first, then describe what you want to test.'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[70%] rounded-none p-4',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.testPlan && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.testPlan.testSuites.reduce((acc, s) => acc + s.cases.length, 0)} test cases generated
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-none p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating test plan...
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-none p-1.5">
          <div className="relative">
            <div className="relative flex flex-col">
              <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                <Textarea
                  value={value}
                  placeholder={selectedProject ? `Describe what you want to test on ${selectedProject.name}...` : 'Select a project first...'}
                  className={cn(
                    'w-full rounded-none px-4 py-3 bg-transparent border-none dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none focus-visible:ring-0 focus-visible:ring-offset-0',
                    'min-h-[72px]'
                  )}
                  ref={textareaRef}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    setValue(e.target.value)
                    adjustHeight()
                  }}
                  disabled={!selectedProjectId}
                />
              </div>

              <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-b-none flex items-center">
                <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-none dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedModel}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center gap-1"
                            >
                              {MODEL_ICONS[selectedModel]}
                              {selectedModel}
                              <ChevronDown className="w-3 h-3 opacity-50" />
                            </motion.div>
                          </AnimatePresence>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-[10rem] rounded-none">
                        {AI_MODELS.map((model) => (
                          <DropdownMenuItem
                            key={model}
                            onSelect={() => setSelectedModel(model)}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              {MODEL_ICONS[model] || <Bot className="w-4 h-4 opacity-50" />}
                              <span>{model}</span>
                            </div>
                            {selectedModel === model && <Check className="w-4 h-4 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-0.5" />
                    <label className="rounded-none p-2 bg-gray-300 dark:bg-gray-600 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                      <input type="file" className="hidden" />
                      <Paperclip className="w-4 h-4" />
                    </label>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'rounded-none p-2 bg-gray-300 dark:bg-gray-600',
                      'hover:bg-gray-400 dark:hover:bg-gray-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    disabled={!value.trim() || isGenerating || !selectedProjectId}
                    onClick={handleSend}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className={cn('w-4 h-4 transition-opacity', value.trim() && selectedProjectId ? 'opacity-100' : 'opacity-30')} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
