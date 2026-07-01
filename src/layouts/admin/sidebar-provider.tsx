'use client'
import * as React from 'react'
import { SIDEBAR_COOKIE_NAME, useSidebar } from '@/hooks/use-sidebar'

export function SidebarProvider ({ children }: { children: React.ReactNode }) {
  React.useState(() => {
    if (typeof document === 'undefined') return

    const match = document.cookie.match(
      new RegExp(`${SIDEBAR_COOKIE_NAME}=(true|false)`)
    )

    if (match) {
      useSidebar.setState({ isOpen: match[1] === 'true' })
    }
  })

  return <>{children}</>
}
