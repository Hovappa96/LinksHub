import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSearchModal } from 'context/SearchModalContext'
import { database } from 'database/data'
import { Icons } from 'components/icons'
import Logo from 'components/logo/logo'
import { IData } from 'types'

const MAX_RESULTS = 50
const RECENT_SEARCHES_KEY = 'linkshub_recent_searches'

export const SearchModal = () => {
  const { isOpen, close, searchQuery: globalQuery, setSearchQuery: setGlobalQuery } = useSearchModal()
  const [query, setQuery] = useState(globalQuery)
  const [selected, setSelected] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Sync local query with global query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(globalQuery)
      const recent = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (recent) {
        setRecentSearches(JSON.parse(recent))
      }
    }
  }, [isOpen, globalQuery])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Update global query when local query changes
  useEffect(() => {
    setGlobalQuery(query)
  }, [query, setGlobalQuery])

  const results = query.trim()
    ? searchResources(query)
    : []

  const totalItems = query.trim() ? results.length + 1 : 0 // +1 for "Search for" option

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => Math.min(prev + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim() && selected === 0) {
        // "Search for" option selected
        searchByKeyword(query)
      } else if (results[selected - 1]) {
        // -1 because first item is "Search for"
        navigate(results[selected - 1])
      }
    } else if (e.key === 'Escape') {
      close()
    }
  }

  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const recent = Array.from(new Set([searchQuery, ...recentSearches])).slice(0, 5)
    setRecentSearches(recent)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent))
  }, [recentSearches])

  const navigate = useCallback((item: IData) => {
    saveRecentSearch(query)
    close()
    setQuery('')
    setSelected(0)
    router.push(`/${item.category}/${item.subcategory}`)
  }, [query, close, router, saveRecentSearch])

  const searchByKeyword = useCallback((keyword: string) => {
    saveRecentSearch(keyword)
    close()
    // Don't clear query - keep it for when modal reopens
    setSelected(0)
    router.push({
      pathname: '/search',
      query: { query: keyword }
    })
  }, [close, router, saveRecentSearch])

  const handleRecentClick = (search: string) => {
    setQuery(search)
    inputRef.current?.focus()
  }

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current || !query.trim()) return

    // Find all selectable items (buttons) within the results container
    const buttons = resultsRef.current.querySelectorAll('button')
    const selectedButton = buttons[selected]

    if (selectedButton) {
      selectedButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selected, query])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-4 sm:pt-[15vh] px-2 sm:px-4"
      data-custom="restrict-click-outside"
      onClick={close}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" data-custom="restrict-click-outside" />

      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg sm:rounded-lg shadow-2xl overflow-hidden"
        data-custom="restrict-click-outside"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 border-b border-gray-200 dark:border-gray-700">
          <Icons.search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full py-3 sm:py-4 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm sm:text-base"
            placeholder="Search LinksHub..."
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelected(0)
            }}
          />
          <kbd className="hidden sm:block px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto px-1 sm:px-2 py-2"
        >
          {query.trim() === '' && recentSearches.length > 0 && (
            <div className="px-1 sm:px-2 py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                Recent Searches
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(search)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <Icons.search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim() !== '' && (
            <div className="space-y-1">
              {/* Search for [query] option - always first */}
              <button
                onClick={() => searchByKeyword(query)}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-left transition-colors ${
                  selected === 0
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icons.search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                    Search for <span className="text-primary">&ldquo;{query}&rdquo;</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                    Find all resources matching this keyword
                  </div>
                </div>
                {selected === 0 && (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                    ↵
                  </kbd>
                )}
              </button>

              {/* Regular results */}
              {results.length > 0 && (
                <>
                  <div className="px-2 sm:px-3 pt-2 pb-1">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Quick Links
                    </div>
                  </div>
                  {results.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item)}
                      className={`w-full flex items-start gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-left transition-colors ${
                        idx + 1 === selected
                          ? 'bg-primary/10 dark:bg-primary/20'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.description}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs">
                          <span className="text-gray-400 dark:text-gray-500 truncate">
                            {item.category}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">›</span>
                          <span className="text-gray-400 dark:text-gray-500 truncate">
                            {item.subcategory}
                          </span>
                        </div>
                      </div>
                      {idx + 1 === selected && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                            ↵
                          </kbd>
                        </div>
                      )}
                    </button>
                  ))}
                </>
              )}

              {results.length === 0 && (
                <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No quick links found. <span className="hidden sm:inline">Press Enter to search all resources.</span><span className="sm:hidden">Tap to search all resources.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center sm:justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
              <span>to select</span>
            </div>
            {results.length > 0 && (
              <span className="text-[10px] sm:text-xs">{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center justify-center">
            <div className="scale-[0.35] sm:scale-50 origin-center sm:origin-right -mr-4 sm:-mr-0">
              <Logo />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function searchResources(query: string): IData[] {
  const normalizedQuery = query.toLowerCase().trim()
  const words = normalizedQuery.split(/\s+/)

  const allResources = database.flat()

  const scored = allResources.map(item => {
    let score = 0
    const name = item.name.toLowerCase()
    const desc = item.description?.toLowerCase() || ''

    // Exact match gets highest score
    if (name === normalizedQuery) score += 100
    if (name.startsWith(normalizedQuery)) score += 50
    if (name.includes(normalizedQuery)) score += 30

    // Description match
    if (desc.includes(normalizedQuery)) score += 10

    // Word matches
    words.forEach(word => {
      if (name.includes(word)) score += 5
      if (desc.includes(word)) score += 2
    })

    return { item, score }
  })

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ item }) => item)
}
