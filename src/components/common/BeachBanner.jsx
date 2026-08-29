import { Sparkles } from 'lucide-react';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import defaultBeachImage from '../../pages/public/image/Gemini_Generated_Image_kxdt3pkxdt3pkxdt.png';

export default function BeachBanner({
  badge = 'Muzhappilangad Drive-In Beach',
  title,
  subtitle,
  image = defaultBeachImage,
  tabId = null,
  icon: Icon = Sparkles,
  children,
  className = '',
}) {
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const customBanner = tabId && appearance.banners?.[tabId];
  const activeImage = customBanner || image || defaultBeachImage;

  return (
    <div
      className={`relative min-h-[210px] sm:min-h-[225px] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800 flex flex-col justify-end p-5 sm:p-6 mb-4 ${className}`}
    >
      {/* Background Beach Photo */}
      {activeImage && (
        <img
          src={activeImage}
          alt="Beach Background"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
      )}

      {/* Sleek Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40" />

      {/* Banner Content */}
      <div className="relative z-10 space-y-1.5">
        {badge && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 drop-shadow-sm">
            {Icon && <Icon className="h-3.5 w-3.5 text-amber-300" />}
            <span>{badge}</span>
          </div>
        )}
        {title && (
          <h2 className="text-xl font-extrabold leading-snug sm:text-2xl text-white drop-shadow-md">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow-xs leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="pt-1.5">{children}</div>}
      </div>
    </div>
  );
}
