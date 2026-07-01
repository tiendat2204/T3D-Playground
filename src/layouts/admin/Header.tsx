'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const Header = () => {
  return (
    <header className='sticky top-0 z-20 flex w-full bg-card border-b dark:border-gray-800'>
      <div className='mx-4 flex h-16 w-full items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
        </div>
        <div className='flex items-center gap-4 '>
          <ThemeToggle />
          <div className='hidden md:flex items-center gap-2'>
            <Button
              variant='outline'
              className='relative h-9 w-64 justify-start bg-muted/50 text-sm font-normal text-muted-foreground shadow-none'
              onClick={() => {
                const e = new KeyboardEvent('keydown', {
                  key: 'k',
                  ctrlKey: true,
                  bubbles: true,
                  cancelable: true
                })

                document.dispatchEvent(e)
              }}
            >
              <Search className='mr-2 h-4 w-4' />
              <span>Search commands...</span>
              <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded-none border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
                <span className='text-xs'>⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
