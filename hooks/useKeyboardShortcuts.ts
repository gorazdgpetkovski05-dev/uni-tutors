import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useKeyboardShortcuts = (onToggleHelp: () => void) => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((document.activeElement as HTMLElement)?.isContentEditable) return;

      switch (e.key) {
        case '/': {
          e.preventDefault();
          const input = document.querySelector<HTMLInputElement>('[data-search-input]');
          input?.focus();
          break;
        }
        case 'Escape': {
          const overlay = document.querySelector('[data-modal-overlay]');
          if (overlay instanceof HTMLElement) overlay.click();
          break;
        }
        case 'd': {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          break;
        }
        case '?': {
          onToggleHelp();
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [theme, setTheme, onToggleHelp]);
};
