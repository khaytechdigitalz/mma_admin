"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/icons";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  /** Debounce delay (ms) before onSearch fires while typing. */
  debounceMs?: number;
}

/**
 * Plain, real search input - debounced onSearch fires as the user types, and
 * immediately on Enter. Previously this rendered a combobox of hardcoded
 * fake "recent searches" (iPhone/Macbook/etc, irrelevant to this admin
 * panel), and onSearch only fired when a suggestion was clicked - typing
 * alone never triggered a real search on any of the ~10+ tables that use
 * this component. Removed the fake data and wired typing straight through.
 */
export default function SearchInput({
  placeholder = "Search...",
  className,
  onSearch,
  debounceMs = 400,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch?.(query);
    }
  };

  return (
    <div className={cn("relative sm:w-[300px] w-full", className)}>
      <SearchIcon className="absolute size-4 text-light-primary-text left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-9 w-full pr-3.5 ring h-9 ring-gray-500/20 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-primary transition-all font-normal text-light-primary-text placeholder:text-light-secondary-text"
      />
    </div>
  );
}
