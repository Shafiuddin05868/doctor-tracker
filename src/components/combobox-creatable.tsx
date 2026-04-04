"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { ChevronsUpDown, Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxItem {
  _id: string;
  name: string;
}

interface ComboboxCreatableProps {
  value: string;
  onChange: (value: string) => void;
  items: ComboboxItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  onSearch: (search: string) => void;
  onLoadMore: () => void;
  onCreate: (name: string) => Promise<ComboboxItem>;
  placeholder?: string;
  searchPlaceholder?: string;
  selectedLabel?: string;
}

export function ComboboxCreatable({
  value,
  onChange,
  items,
  isLoading,
  hasMore,
  onSearch,
  onLoadMore,
  onCreate,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  selectedLabel,
}: ComboboxCreatableProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const prevSearchRef = useRef("");
  useEffect(() => {
    if (debouncedSearch !== prevSearchRef.current) {
      prevSearchRef.current = debouncedSearch;
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoading) return;
    const scrollPercent = (el.scrollTop + el.clientHeight) / el.scrollHeight;
    if (scrollPercent > 0.67) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  async function handleCreate() {
    if (!search.trim()) return;
    setCreating(true);
    try {
      const created = await onCreate(search.trim());
      onChange(created._id);
      setSearch("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  const exactMatch = items.some(
    (item) => item.name.toLowerCase() === search.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-30 max-h-50 overflow-y-auto px-1 pb-1"
        >
          {items.length === 0 && !isLoading && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          )}

          {items.map((item) => (
            <button
              key={item._id}
              onClick={() => {
                onChange(item._id);
                setOpen(false);
                setSearch("");
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                value === item._id && "bg-accent"
              )}
            >
              <Check
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  value === item._id ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{item.name}</span>
            </button>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {search.trim() && !exactMatch && (
          <div className="border-t p-1">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Create &quot;{search.trim()}&quot;
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
