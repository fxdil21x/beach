import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(value !== undefined ? value : defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, handleTabChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div
      className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500 shadow-inner ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', disabled = false, activeColor }) {
  const { activeTab, handleTabChange } = useContext(TabsContext);
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = activeColor || appearance.accentColor || '#0284C7';
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => handleTabChange(value)}
      className={`relative inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${
        isActive
          ? 'font-bold'
          : 'text-slate-600 hover:text-slate-900'
      } ${className}`}
      style={{
        color: isActive ? accentColor : undefined,
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="absolute inset-0 rounded-lg bg-white shadow-sm"
        />
      )}
      <motion.span
        key={isActive ? `active-${value}` : `inactive-${value}`}
        animate={
          isActive
            ? {
                y: [0, -5, 0, -3, 0],
                scale: [1, 1.06, 1, 1.03, 1],
              }
            : { y: 0, scale: 1 }
        }
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
        className="relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
      >
        {children}
      </motion.span>
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="tabpanel"
      className={`mt-3 outline-none ${className}`}
    >
      {children}
    </motion.div>
  );
}
