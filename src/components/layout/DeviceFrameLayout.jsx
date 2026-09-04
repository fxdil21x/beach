import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, Battery } from 'lucide-react';

const DESKTOP_QUERY = '(min-width: 768px)';

function useDesktopFrame() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export default function DeviceFrameLayout() {
  const isDesktop = useDesktopFrame();
  const location = useLocation();
  const modalLayerRef = useRef(null);

  // Reset window scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDesktop) {
      document.documentElement.classList.remove('device-frame-active');
      window.__deviceModalLayer = null;
      return undefined;
    }
    document.documentElement.classList.add('device-frame-active');
    return () => {
      document.documentElement.classList.remove('device-frame-active');
      window.__deviceModalLayer = null;
    };
  }, [isDesktop]);

  // Register modal layer ref on window so CommonModal can portal into it
  useEffect(() => {
    if (isDesktop && modalLayerRef.current) {
      window.__deviceModalLayer = modalLayerRef.current;
    }
    return () => {
      window.__deviceModalLayer = null;
    };
  }, [isDesktop, modalLayerRef.current]);

  if (!isDesktop) {
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full min-h-screen flex flex-col relative bg-slate-50"
      >
        <Outlet />
      </motion.div>
    );
  }

  return (
    <div className="device-frame-stage">
      <div className="device-frame-scale">
        <div className="device-frame-scale-inner">
          {/* Modern iPhone Device Frame */}
          <div className="iphone-chassis relative select-none">
            {/* Left Side Hardware Buttons (Action + Volume Up / Down) */}
            <div className="absolute -left-[14px] top-24 h-7 w-[4px] rounded-l bg-zinc-700 shadow-xs" />
            <div className="absolute -left-[14px] top-36 h-12 w-[4px] rounded-l bg-zinc-700 shadow-xs" />
            <div className="absolute -left-[14px] top-52 h-12 w-[4px] rounded-l bg-zinc-700 shadow-xs" />
            {/* Right Side Power Button */}
            <div className="absolute -right-[14px] top-32 h-16 w-[4px] rounded-r bg-zinc-700 shadow-xs" />

            {/* Device Screen Bezel */}
            <div className="relative flex h-[852px] w-[393px] flex-col overflow-hidden rounded-[54px] border-[11px] border-[#18181b] bg-[#09090b] shadow-[0_25px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
              {/* Top iOS Status Bar with Dynamic Island */}
              <div className="relative z-50 flex shrink-0 items-center justify-between px-7 pt-3.5 pb-1 text-[12px] font-semibold bg-white/95 text-slate-900 backdrop-blur-md select-none">
                <span className="font-bold tracking-tight">9:41</span>

                {/* Dynamic Island Capsule */}
                <div className="flex h-6 w-28 items-center justify-between rounded-full bg-black px-2.5 shadow-md ring-1 ring-white/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span className="h-3 w-3 rounded-full bg-zinc-800" />
                </div>

                {/* Right Status Icons */}
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Wifi className="h-3.5 w-3.5 stroke-[2.3]" />
                  <Battery className="h-4 w-4 stroke-[2.3]" />
                </div>
              </div>

              {/* Inner Screen Viewport & App Router Content */}
              <div className="device-app-root relative flex-1 min-h-0 overflow-hidden bg-slate-50 text-slate-900">
                {/* Portal layer: modals render here to stay inside device screen */}
                <div ref={modalLayerRef} className="device-modal-layer" />

                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="w-full h-full flex flex-col min-h-0 relative"
                >
                  <Outlet />
                </motion.div>
              </div>

              {/* Bottom iOS Home Indicator */}
              <div className="relative z-50 flex shrink-0 justify-center py-1.5 bg-white/95 backdrop-blur-md select-none">
                <div className="h-1 w-32 rounded-full bg-slate-400/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
