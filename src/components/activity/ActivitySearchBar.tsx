import { Search, X, Loader2 } from 'lucide-react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'

interface ActivitySearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  delay?: number
}

/**
 * Search bar component for activity filtering
 * Features debounced search to avoid excessive filtering
 */
export function ActivitySearchBar({
  onSearch,
  placeholder = 'Search activities by name, ID, or description...',
  delay = 300,
}: ActivitySearchBarProps) {
  const { query, setQuery, isSearching, clearSearch } = useDebouncedSearch({
    delay,
    onSearch,
  })

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm border border-border/50 rounded-xs bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Searching indicator */}
      {isSearching && query && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Search results hint */}
      {query && !isSearching && (
        <div className="text-xs text-muted-foreground mt-1">
          Searching for "{query}"
        </div>
      )}
    </div>
  )
}

export default ActivitySearchBar
