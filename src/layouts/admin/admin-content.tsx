import { SidebarInset } from '@/components/ui/sidebar'
import Header from '@/layouts/admin/Header'

export function AdminContent ({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <Header />
      <div className='flex-1 bg-background '>
        {children}
      </div>
    </SidebarInset>
  )
}
