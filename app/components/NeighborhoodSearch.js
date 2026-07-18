"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { filterCitySuggestions } from "../data/cities";

function slugifySegment(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Translates a free-text query ("Sauk Rapids, MN", "Austin TX", "Miami")
 * into the SEO route `/move-to/{stateSlug}/{citySlug}`.
 */
function buildMoveToPath(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let cityPart = trimmed;
  let statePart = "";

  if (trimmed.includes(",")) {
    const [rawCity, rawState = ""] = trimmed.split(",");
    cityPart = rawCity;
    statePart = rawState;
  } else {
    const tokens = trimmed.split(/\s+/);
    const last = tokens[tokens.length - 1];
    if (tokens.length > 1 && /^[A-Za-z]{2}$/.test(last)) {
      statePart = tokens.pop();
      cityPart = tokens.join(" ");
    }
  }

  const citySlug = slugifySegment(cityPart);
  if (!citySlug) return null;

  const stateSlug = slugifySegment(statePart) || "us";
  return `/move-to/${stateSlug}/${citySlug}`;
}

/**
 * Zip-code suggestions carry the real "City, ST" in their region field,
 * so prefer that for building the SEO path.
 */
function resolveSuggestionValue(city) {
  const label = city.label.trim();
  const isZip = /^\d{5}$/.test(label);
  if (isZip && city.region && city.region.includes(",")) {
    return city.region;
  }
  return label;
}

export default function NeighborhoodSearch() {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const navigateToSearch = useCallback(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const path = buildMoveToPath(trimmed);
      if (!path) return;

      setQuery(trimmed);
      setSuggestions([]);
      setActiveIndex(-1);
      setIsOpen(false);
      router.push(path);
    },
    [router]
  );

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);

    const matches = filterCitySuggestions(value);
    setSuggestions(matches);
    setActiveIndex(matches.length > 0 ? 0 : -1);
    setIsOpen(matches.length > 0);
  };

  const handleSelect = (city) => {
    navigateToSearch(resolveSuggestionValue(city));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex]);
      return;
    }
    navigateToSearch(query);
  };

  const handleKeyDown = (event) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "ArrowDown" && query.trim()) {
        const matches = filterCitySuggestions(query);
        if (matches.length > 0) {
          setSuggestions(matches);
          setActiveIndex(0);
          setIsOpen(true);
        }
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
        break;
      case "Enter":
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          event.preventDefault();
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setSuggestions([]);
        setActiveIndex(-1);
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:bg-white sm:p-2 sm:shadow-2xl sm:shadow-emerald-900/30"
      role="search"
    >
      <label htmlFor="neighborhood-search" className="sr-only">
        Search neighborhood or city
      </label>

      <div ref={containerRef} className="relative flex-1">
        <svg
          className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        <input
          ref={inputRef}
          id="neighborhood-search"
          type="search"
          name="q"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim()) {
              const matches = filterCitySuggestions(query);
              setSuggestions(matches);
              setIsOpen(matches.length > 0);
              setActiveIndex(matches.length > 0 ? 0 : -1);
            }
          }}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          placeholder="Search city, zip, or neighborhood..."
          className="w-full rounded-full border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:border-0 sm:py-3.5"
        />

        {isOpen && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 text-left shadow-2xl shadow-slate-900/20"
          >
            {suggestions.map((city, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={`${city.label}-${city.region}`}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">{city.label}</span>
                    <span
                      className={`shrink-0 text-xs ${
                        isActive ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {city.region}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="submit"
        className="rounded-full bg-emerald-500 px-8 py-4 text-sm font-bold text-white transition hover:bg-emerald-400 sm:py-3.5"
      >
        Explore Free Preview
      </button>
    </form>
  );
}
