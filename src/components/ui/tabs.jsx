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
  const hasWidth = /\bw-(?:full|auto|fit|\d+|\[.*?\])/.test(className);
  return (
    <div
      role="tablist"
      className={`inline-flex h-9 sm:h-10 ${hasWidth ? '' : 'w-full'} items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 text-slate-500 shadow-inner ${className}`}
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
  const hasFlex = /\b(?:flex-1|shrink-0|grow-0|w-auto|w-fit)\b/.test(className);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => handleTabChange(value)}
      className={`relative inline-flex ${hasFlex ? '' : 'flex-1'} items-center justify-center whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${
        isActive
          ? 'text-white font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      } ${className}`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="absolute inset-0 rounded-lg shadow-sm"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 3px 12px ${appearance.glowColor || 'rgba(2, 132, 199, 0.35)'}`,
          }}
        />
      )}
      <motion.span
        key={isActive ? `active-${value}` : `inactive-${value}`}
        animate={
          isActive
            ? {
                y: [0, -3, 0, -1.5, 0],
                scale: [1, 1.03, 1, 1.01, 1],
              }
            : { y: 0, scale: 1 }
        }
        transition={{
          duration: 0.35,
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
