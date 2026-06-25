import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CommandPaletteContext = createContext(null);

export function CommandPaletteProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextItem, setContextItem] = useState(null); // e.g., current task

  const open = useCallback((context = null) => {
    setContextItem(context);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setContextItem(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (prev) setContextItem(null);
      return !prev;
    });
  }, []);

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, toggle, close]);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, contextItem, open, close, toggle }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
}
