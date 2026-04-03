import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Course } from '../types';

const LS_KEY = 'recent_searches';

interface Props { courses: Course[]; onSearch: (term: string) => void; placeholder?: string }

export const SearchCombobox: React.FC<Props> = ({ courses, onSearch, placeholder }) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [recents, setRecents] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } });

  const saveRecent = (term: string) => {
    const next = [term, ...recents.filter(r => r !== term)].slice(0, 5);
    setRecents(next); localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const items = useMemo(() => input.trim()
    ? courses.filter(c => !c.hidden && c.title.toLowerCase().includes(input.toLowerCase())).slice(0, 5)
    : [], [input, courses]);
  const showRecents = open && !input.trim() && recents.length > 0;
  const showNoResults = open && input.trim().length > 1 && items.length === 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setActiveIdx(-1); }, [input]);

  const handleKey = (e: React.KeyboardEvent) => {
    const listLen = showRecents ? recents.length : items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, listLen - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      if (showRecents) { const term = recents[activeIdx]; setInput(term); onSearch(term); setOpen(false); }
      else if (items[activeIdx]) { saveRecent(input.trim()); navigate(`/courses/${items[activeIdx].id}`); setOpen(false); }
    }
  };

  const highlight = (text: string) => {
    const idx = text.toLowerCase().indexOf(input.toLowerCase());
    if (idx < 0 || !input.trim()) return text;
    return <>{text.slice(0, idx)}<mark className="bg-indigo-200 dark:bg-indigo-700 text-inherit rounded-sm px-0.5">{text.slice(idx, idx + input.length)}</mark>{text.slice(idx + input.length)}</>;
  };

  const dropdownOpen = open && (showRecents || items.length > 0 || showNoResults);

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        aria-label={placeholder || t('searchPlaceholder')}
        placeholder={placeholder || t('searchPlaceholder')}
        value={input}
        onChange={e => { setInput(e.target.value); onSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-full sm:w-64 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
      />
      {dropdownOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          {showRecents && (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('recentSearches')}</span>
                <button onClick={() => { setRecents([]); localStorage.removeItem(LS_KEY); }} className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300">{t('clearRecent')}</button>
              </div>
              {recents.map((term, i) => (
                <button key={term} onClick={() => { setInput(term); onSearch(term); setOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${i === activeIdx ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'} text-gray-700 dark:text-gray-300`}>
                  <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />{term}
                </button>
              ))}
            </>
          )}
          {items.map((course, i) => (
            <button key={course.id} onClick={() => { saveRecent(input.trim()); navigate(`/courses/${course.id}`); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${i === activeIdx ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'} text-gray-700 dark:text-gray-300`}>
              <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />{highlight(course.title)}
            </button>
          ))}
          {showNoResults && (
            <div className="px-3 py-4 text-sm text-center text-gray-400 dark:text-gray-500">{t('noResults')}</div>
          )}
        </div>
      )}
    </div>
  );
};
