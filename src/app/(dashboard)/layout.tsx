import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/layouts/admin/admin-sidebar'
import { AdminContent } from '@/layouts/admin/admin-content'
import { SidebarProvider as SidebarCookieProvider } from '@/layouts/admin/sidebar-provider'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarCookieProvider>
      <SidebarProvider>
        <AdminSidebar />
        <AdminContent>
          {children}
        </AdminContent>
      </SidebarProvider>
    </SidebarCookieProvider>
  )
}
