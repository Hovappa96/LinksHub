import { memo, FC } from 'react'
import { SideNavbarCategoryList } from 'components/SideNavbar/SideNavbarCategoryList'
import { useSearchModal } from 'context/SearchModalContext'
import { Icons } from 'components/icons'

const MemoizedSideNavbarCategoryList = memo(SideNavbarCategoryList)

const SideNavbarBody: FC = () => {
  const { open, searchQuery } = useSearchModal()

  return (
    <div className="fixed top-0 left-0 w-full h-[calc(100vh-80px)] flex flex-col items-start px-6 py-4  gap-4 tall:gap-10 bg-white dark:bg-[#161E2C] shadow-sidebar dark:shadow-none">
      <div className="w-full flex flex-col gap-4 tall:gap-6">
        {/* Search Button */}
        <button
          onClick={open}
          className="w-full h-12 flex items-center justify-between px-4 py-3 bg-slate-100 bg-opacity-50 dark:bg-zinc-400 dark:bg-opacity-20 rounded-lg border border-theme-secondary/25 dark:border-none hover:shadow-input-hover focus:shadow-input-focus dark:hover:shadow-input-hover-dark dark:focus:shadow-input-focus-dark transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <Icons.search className="h-5 w-5 text-gray-400 group-hover:text-primary dark:group-hover:text-slate-100 transition-colors" />
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {searchQuery || 'Quick search...'}
            </span>
          </div>
          <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="w-full max-h-[calc(100vh-190px)] h-full flex flex-col items-between gap-2 tall:gap-5">
        <MemoizedSideNavbarCategoryList query={searchQuery} />
      </div>
    </div>
  )
}

export default SideNavbarBody
