import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchModalContextType {
  isOpen: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  open: () => void
  close: () => void
  toggle: () => void
}

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined)

export const SearchModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return (
    <SearchModalContext.Provider value={{ isOpen, searchQuery, setSearchQuery, open, close, toggle }}>
      {children}
    </SearchModalContext.Provider>
  )
}

export const useSearchModal = () => {
  const context = useContext(SearchModalContext)
  if (!context) {
    throw new Error('useSearchModal must be used within SearchModalProvider')
  }
  return context
}
