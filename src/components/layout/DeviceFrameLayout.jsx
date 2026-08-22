import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';
import UserLocationTracker from '../../pages/user/home/components/UserLocationTracker.jsx';
import AdminEmergencyOverlay from '../notifications/AdminEmergencyOverlay.jsx';

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

  useEffect(() => {
    if (!isDesktop) return undefined;
    document.documentElement.classList.add('device-frame-active');
    return () => document.documentElement.classList.remove('device-frame-active');
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <>
        <UserLocationTracker />
        <AdminEmergencyOverlay />
        <Outlet />
      </>
    );
  }

  return (
    <div className="device-frame-stage">
      <div className="device-frame-scale">
        <div className="device-frame-scale-inner">
          <DeviceFrameset device="iPad Mini" color="black">
            <div className="device-app-root">
              <UserLocationTracker />
              <AdminEmergencyOverlay />
              <Outlet />
            </div>
          </DeviceFrameset>
        </div>
      </div>
    </div>
  );
}
