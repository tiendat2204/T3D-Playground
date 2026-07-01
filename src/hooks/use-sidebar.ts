import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'

type SidebarSettings = { disabled: boolean, isHoverOpen: boolean }

type SidebarStore = {
  isOpen: boolean
  isHover: boolean
  settings: SidebarSettings
  toggleOpen: () => void
  setIsOpen: (isOpen: boolean) => void
  setIsHover: (isHover: boolean) => void
  getOpenState: () => boolean
  setSettings: (settings: Partial<SidebarSettings>) => void
}

export const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function setSidebarCookie (isOpen: boolean) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${isOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`
}

export const useSidebar = create(
  persist<SidebarStore>(
    (set, get) => ({
      isOpen: true,
      isHover: false,
      settings: { disabled: false, isHoverOpen: false },
      toggleOpen: () => {
        const newIsOpen = !get().isOpen

        set({ isOpen: newIsOpen })
        setSidebarCookie(newIsOpen)
      },
      setIsOpen: (isOpen: boolean) => {
        set({ isOpen })
        setSidebarCookie(isOpen)
      },
      setIsHover: (isHover: boolean) => {
        set({ isHover })
      },
      getOpenState: () => {
        const state = get()

        return state.isOpen || (state.settings.isHoverOpen && state.isHover)
      },
      setSettings: (settings: Partial<SidebarSettings>) => {
        set(
          produce((state: SidebarStore) => {
            state.settings = { ...state.settings, ...settings }
          })
        )
      }
    }),
    {
      name: 'sidebar',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setSidebarCookie(state.isOpen)
        }
      }
    }
  )
)
