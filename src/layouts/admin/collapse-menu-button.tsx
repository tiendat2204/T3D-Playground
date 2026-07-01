'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, Dot } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

type Submenu = {
  href: string
  label: string
  active?: boolean
}

interface CollapseMenuButtonProps {
  icon: LucideIcon
  label: string
  active: boolean
  submenus: Submenu[]
  isOpen: boolean | undefined
}

export function CollapseMenuButton ({
  icon: Icon,
  label,
  submenus,
  isOpen
}: CollapseMenuButtonProps) {
  const pathname = usePathname()

  const isSubmenuActive = submenus.some((submenu) =>
    submenu.active === undefined
      ? (submenu.href === pathname || pathname.startsWith(submenu.href + '/'))
      : submenu.active
  )
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive)

  return isOpen
    ? (
      <Collapsible
        open={isCollapsed}
        onOpenChange={setIsCollapsed}
        className='w-full'
      >
        <CollapsibleTrigger
          className='[&[data-state=open]>div>div>svg]:rotate-180 mb-1'
          asChild
        >
          <Button
            variant={isSubmenuActive ? 'secondary' : 'ghost'}
            className='w-full justify-start h-10'
          >
            <div className='w-full items-center flex justify-between'>
              <div className='flex items-center'>
                <span className='mr-4'>
                  <Icon size={18} />
                </span>
                <p
                  className={cn(
                    'max-w-[150px] truncate',
                    isOpen
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-96 opacity-0'
                  )}
                >
                  {label}
                </p>
              </div>
              <div
                className={cn(
                  'whitespace-nowrap',
                  isOpen
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-96 opacity-0'
                )}
              >
                <ChevronDown
                  size={18}
                  className='transition-transform duration-200'
                />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
          {submenus.map(({ href, label, active }, index) => {
            const isSubActive = active === undefined
              ? (pathname === href || pathname.startsWith(href + '/'))
              : active

            return (
              <Button
                key={index}
                variant={isSubActive ? 'secondary' : 'ghost'}
                className='w-full justify-start h-10 mb-1'
                asChild
              >
                <Link href={href}>
                  <span className=' '>
                    <Dot size={18} />
                  </span>
                  <p
                    className={cn(
                      'max-w-[170px] truncate',
                      isOpen
                        ? 'translate-x-0 opacity-100'
                        : '-translate-x-96 opacity-0'
                    )}
                  >
                    {label}
                  </p>
                </Link>
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    )
    : (
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSubmenuActive ? 'secondary' : 'ghost'}
                  className='w-full justify-start h-10 mb-1'
                >
                  <div
                    className={`w-full items-center flex  ${
                      isOpen ? ' justify-center' : 'justify-center'
                    }`}
                  >
                    <div className='flex items-center'>
                      <span className={cn(isOpen === false ? '' : 'mr-4')}>
                        <Icon size={18} />
                      </span>
                      {isOpen && (
                        <p
                          className={cn(
                            'max-w-[160px] truncate',
                            isOpen
                              ? 'translate-x-0 opacity-100'
                              : '-translate-x-96 opacity-0'
                          )}
                        >
                          {label}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side='right' align='center' alignOffset={2}>
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side='right' sideOffset={25} align='start'>
          <DropdownMenuLabel className='max-w-[190px] truncate'>
            {label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {submenus.map(({ href, label, active }, index) => {
            const isSubActive = active === undefined
              ? (pathname === href || pathname.startsWith(href + '/'))
              : active

            return (
              <DropdownMenuItem key={index} asChild>
                <Link
                  className={`cursor-pointer ${
                    isSubActive
                      ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary-foreground'
                      : ''
                  }`}
                  href={href}
                >
                  <p className='max-w-[180px] truncate'>{label}</p>
                </Link>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuArrow className='fill-border' />
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
