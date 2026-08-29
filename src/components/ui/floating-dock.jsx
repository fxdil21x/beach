import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '../../utils/cn.js';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

export function FloatingDock({
  items,
  className,
  mobileClassName,
}) {
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const navComp = Array.isArray(appearance.components) ? appearance.components.find((c) => c.id === 'nav') : null;
  const isFlush = (appearance.dockStyle || navComp?.style) === 'flush';

  return (
    <div className={cn('floating-dock-wrapper w-full flex justify-center pointer-events-none', isFlush ? 'max-w-full' : 'max-w-lg mx-auto', className)}>
      <FloatingDockCore items={items} className={mobileClassName} />
    </div>
  );
}

function FloatingDockCore({ items, className }) {
  const mouseX = useMotionValue(Infinity);
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const navComp = Array.isArray(appearance.components) ? appearance.components.find((c) => c.id === 'nav') : null;
  const isFlush = (appearance.dockStyle || navComp?.style) === 'flush';
  const accentColor = appearance.accentColor || '#0284C7';
  const glowColor = appearance.glowColor || 'rgba(2, 132, 199, 0.35)';

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'pointer-events-auto w-full flex items-center justify-around backdrop-blur-2xl transition-all duration-300',
        isFlush
          ? 'rounded-none border-x-0 border-b-0 border-t border-neutral-800/90 bg-neutral-900/95 dark:bg-neutral-900/95 px-2 py-1.5 shadow-none'
          : 'rounded-full bg-neutral-900/95 dark:bg-neutral-900/95 border border-neutral-800/90 px-2 sm:px-4 py-2 sm:py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.32)]',
        className
      )}
    >
      {items.map((item) => (
        <DockIcon key={item.to || item.title} mouseX={mouseX} item={item} accentColor={accentColor} glowColor={glowColor} />
      ))}
    </motion.div>
  );
}

function DockIcon({ mouseX, item, accentColor = '#0284C7', glowColor = 'rgba(2, 132, 199, 0.35)' }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [actionPulse, setActionPulse] = useState(0);
  const location = useLocation();

  // Listen to any page actions, status updates, or refresh events to trigger 2x shake
  useEffect(() => {
    const handleAction = () => {
      setActionPulse((c) => c + 1);
    };

    window.addEventListener('app-action', handleAction);
    window.addEventListener('visitor-entry-updated', handleAction);
    return () => {
      window.removeEventListener('app-action', handleAction);
      window.removeEventListener('visitor-entry-updated', handleAction);
    };
  }, []);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-120, 0, 120], [38, 52, 38]);
  const heightTransform = useTransform(distance, [-120, 0, 120], [38, 52, 38]);

  const widthTransformIcon = useTransform(distance, [-120, 0, 120], [18, 26, 18]);
  const heightTransformIcon = useTransform(distance, [-120, 0, 120], [18, 26, 18]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 160, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 160, damping: 12 });

  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 160, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 160, damping: 12 });

  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      aria-label={item.title}
      className={({ isActive }) =>
        cn(
          'relative flex-1 min-w-0 flex flex-col items-center justify-center rounded-full py-0.5 transition-colors duration-150',
          isActive
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <motion.div
          ref={ref}
          style={{ width, height }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex aspect-square items-center justify-center rounded-full select-none"
        >
          {/* Smooth Gliding Active Pill Background */}
          {isActive && (
            <motion.div
              layoutId="activeDockPill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 rounded-full ring-1.5"
              style={{
                backgroundColor: `${accentColor}25`,
                borderColor: `${accentColor}60`,
                boxShadow: `0 0 14px ${glowColor}`,
              }}
            />
          )}

          {/* Inactive Hover / Tap Feedback */}
          {!isActive && (
            <div className="absolute inset-0 rounded-full hover:bg-gray-100/80 dark:hover:bg-neutral-800/80 active:scale-90 transition-colors" />
          )}

          {/* Animated Tooltip on Desktop Hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 4, x: '-50%' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-xs dark:bg-white/90 dark:text-gray-900"
              >
                {item.title}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icon with 2-time lively bounce + shake animation on active tab / tab change / actions */}
          <motion.div
            key={`${item.to}-${location.pathname}-${actionPulse}`}
            style={{ width: widthIcon, height: heightIcon }}
            animate={
              isActive
                ? {
                    y: [0, -8, 0, -4, 0],
                    rotate: [0, -12, 12, -8, 8, 0],
                    scale: [1, 1.25, 1.06, 1.16, 1],
                  }
                : { y: 0, rotate: 0, scale: 1 }
            }
            transition={{
              duration: 0.55,
              ease: 'easeInOut',
            }}
            className="relative z-10 flex items-center justify-center"
          >
            {Icon ? (
              <Icon
                className="h-full w-full shrink-0 transition-transform"
                strokeWidth={isActive ? 2.4 : 1.9}
                style={{ color: isActive ? accentColor : undefined }}
              />
            ) : null}
          </motion.div>

          {/* Active Dot Indicator with Spring Transition */}
          {isActive && (
            <motion.span
              layoutId="activeDockDot"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute bottom-0 h-1.5 w-1.5 rounded-full z-10"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  );
}
