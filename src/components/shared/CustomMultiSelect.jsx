import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomMultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...",
  renderOption = (opt) => opt.label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optValue, e) => {
    e.stopPropagation();
    const newValue = value.includes(optValue)
      ? value.filter(v => v !== optValue)
      : [...value, optValue];
    onChange(newValue);
  };

  const removeOption = (optValue, e) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optValue));
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={cn(
          "min-h-[40px] w-full rounded-md border border-tp-border bg-tp-bg px-3 py-1.5 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2",
          isOpen ? "border-tp-accent ring-1 ring-tp-accent/20" : "hover:border-tp-border-strong"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 items-center">
          {selectedOptions.length === 0 ? (
            <span className="text-tp-muted">{placeholder}</span>
          ) : (
            selectedOptions.map(opt => (
              <span 
                key={opt.value} 
                className="inline-flex items-center gap-1 rounded bg-tp-surface border border-tp-border-strong px-2 py-0.5 text-xs font-medium text-tp-foreground"
              >
                {renderOption(opt)}
                <button 
                  type="button" 
                  onClick={(e) => removeOption(opt.value, e)}
                  className="rounded-full p-0.5 hover:bg-tp-border transition-colors text-tp-muted hover:text-tp-foreground"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown size={16} className={cn("text-tp-muted transition-transform", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-tp-border-strong bg-tp-surface shadow-tp-lg py-1 max-h-60 overflow-y-auto"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-tp-muted text-center">No options available</div>
            ) : (
              options.map(opt => {
                const isSelected = value.includes(opt.value);
                return (
                  <div 
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-tp-surface-hover",
                      isSelected ? "text-tp-foreground bg-tp-surface-active" : "text-tp-text-secondary"
                    )}
                    onClick={(e) => toggleOption(opt.value, e)}
                  >
                    <span className="flex-1 truncate">{renderOption(opt)}</span>
                    {isSelected && <Check size={14} className="text-tp-accent shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
