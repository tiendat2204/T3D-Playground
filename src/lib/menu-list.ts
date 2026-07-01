import {
  Home,
  FolderKanban,
  TestTube,
  Play,
  Bug,
  Zap,
  Lightbulb,
  Settings,
  type LucideIcon
} from 'lucide-react'

interface Submenu {
  href: string
  label: string
}

interface Menu {
  href: string
  label: string
  icon: LucideIcon
  submenus?: Submenu[]
  active?: boolean
}

interface Group {
  groupLabel: string
  menus: Menu[]
}

export function getMenuList (): Group[] {
  return [
    {
      groupLabel: 'Tổng quan',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: Home
        },
        {
          href: '/projects',
          label: 'Projects',
          icon: FolderKanban
        }
      ]
    },
    {
      groupLabel: 'Test Management',
      menus: [
        {
          href: '/test-cases',
          label: 'Test Cases',
          icon: TestTube
        },
        {
          href: '/test-runs',
          label: 'Test Runs',
          icon: Play
        },
        {
          href: '/bug-reports',
          label: 'Bug Reports',
          icon: Bug
        }
      ]
    },
    {
      groupLabel: 'AI Features',
      menus: [
        {
          href: '/ai-generate',
          label: 'AI Generate',
          icon: Zap
        },
        {
          href: '/ai-suggestions',
          label: 'AI Suggestions',
          icon: Lightbulb
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/settings',
          label: 'Settings',
          icon: Settings
        }
      ]
    }
  ]
}
