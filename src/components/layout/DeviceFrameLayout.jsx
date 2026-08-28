import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';

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
      // Remove device frame active class and clear modal portal target
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
        className="w-full h-full flex flex-col min-h-0 relative"
      >
        <Outlet />
      </motion.div>
    );
  }

  return (
    <div className="device-frame-stage">
      <div className="device-frame-scale">
        <div className="device-frame-scale-inner">
          <DeviceFrameset device="iPad Mini" color="black">
            <div className="device-app-root">
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
          </DeviceFrameset>
        </div>
      </div>
    </div>
  );
}
