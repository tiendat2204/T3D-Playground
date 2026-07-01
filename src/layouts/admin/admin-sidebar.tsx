'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail, useSidebar
} from '@/components/ui/sidebar'
import { Menu } from './menu'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AdminSidebar () {
  const { open } = useSidebar()

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <Link href='/dashboard'>
          <Button
            className='transition-transform ease-in-out duration-300 mb-1 mt-0.5 w-full'
            variant='link'
            asChild
          >
            <span className='w-full h-5 md:h-12 flex items-center justify-center font-bold text-lg'>
              AI Regression
            </span>
          </Button>
        </Link>
      </SidebarHeader>
      <SidebarContent className='scrollbar-hide'>
        <Menu isOpen={open} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
