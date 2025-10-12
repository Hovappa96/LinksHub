import { useEffect } from 'react'
import { useSearchModal } from 'context/SearchModalContext'

export const useSearchModalShortcut = () => {
  const { open, close, isOpen } = useSearchModal()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        open()
        return
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        close()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, close, isOpen])
}
