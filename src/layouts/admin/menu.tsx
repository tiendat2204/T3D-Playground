'use client'
import { Ellipsis } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'
import { CollapseMenuButton } from './collapse-menu-button'
import { getMenuList } from '@/lib/menu-list'

interface MenuProps {
  isOpen: boolean | undefined
}

export function Menu ({ isOpen }: MenuProps) {
  const pathname = usePathname()
  const menuList = getMenuList()

  return (
    <ScrollArea className='[&>div>div[style]]:block! '>
      <nav className=' h-full w-full'>
        <ul className='flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2'>
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn('w-full', groupLabel ? 'pt-5' : '')} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined
                ? (
                  <p className='text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate'>
                    {groupLabel}
                  </p>
                )
                : !isOpen && isOpen !== undefined && groupLabel
                  ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger className='w-full'>
                          <div className='w-full flex justify-center items-center'>
                            <Ellipsis className='h-5 w-5' />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side='right'>
                          <p>{groupLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                  : (
                    <p className='pb-2' />
                  )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, idx) =>
                  !submenus || submenus.length === 0
                    ? (
                      <div className='w-full' key={idx}>
                        <TooltipProvider disableHoverableContent>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={active ? 'secondary' : 'ghost'}
                                className={`w-full  h-10 mb-1 ${
                                  isOpen === false
                                    ? 'justify-center'
                                    : 'justify-start'
                                }`}
                                asChild
                              >
                                <Link href={href}>
                                  <span
                                    className={cn(isOpen === false ? '' : 'mr-4')}
                                  >
                                    {Icon ? <Icon size={18} /> : null}
                                  </span>
                                  {isOpen === false
                                    ? null
                                    : (
                                      <p
                                        className={cn(
                                          'max-w-[200px] truncate',
                                          'translate-x-0 opacity-100'
                                        )}
                                      >
                                        {label}
                                      </p>
                                    )}
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            {isOpen === false && (
                              <TooltipContent side='right'>
                                {label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )
                    : (
                      <div className='w-full' key={idx}>
                        <CollapseMenuButton
                          icon={Icon}
                          label={label}
                          active={
                            active === undefined
                              ? pathname.startsWith(href)
                              : active
                          }
                          submenus={submenus}
                          isOpen={isOpen}
                        />
                      </div>
                    )
              )}
            </li>
          ))}

        </ul>
      </nav>
    </ScrollArea>
  )
}
