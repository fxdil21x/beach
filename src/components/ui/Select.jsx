import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children, defaultValue }) {
  const [selectedValue, setSelectedValue] = useState(value !== undefined ? value : defaultValue);
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    setSelectedValue(val);
    onValueChange?.(val);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: selectedValue, handleSelect, open, setOpen }}>
      <div ref={selectRef} className="relative w-full text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '' }) {
  const { open, setOpen } = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 ring-offset-white transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 active:scale-[0.99] shadow-xs cursor-pointer ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder = 'Select an option...' }) {
  const { value } = useContext(SelectContext);
  return <span className="truncate">{value || placeholder}</span>;
}

export function SelectContent({ children, className = '' }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  const hasPos = className.includes('left-') || className.includes('right-');
  const posClass = hasPos ? '' : 'left-0 right-0';

  return (
    <div
      className={`absolute ${posClass} z-[9999] mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-2xl ring-1 ring-black/5 animate-in fade-in-80 zoom-in-95 ${className}`}
    >
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}


export function SelectGroup({ children }) {
  return <div className="py-0.5">{children}</div>;
}

export function SelectItem({ value, children, className = '' }) {
  const { value: selectedValue, handleSelect } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleSelect(value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors ${
        isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
    >
      <span className="flex-1 truncate">{children}</span>
      {isSelected && <Check className="ml-2 h-4 w-4 text-blue-600 shrink-0" />}
    </div>
  );
}
