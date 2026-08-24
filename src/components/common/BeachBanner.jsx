import { Sparkles } from 'lucide-react';
import defaultBeachImage from '../../pages/public/image/Gemini_Generated_Image_kxdt3pkxdt3pkxdt.png';

export default function BeachBanner({
  badge = 'Muzhappilangad Beach Directory',
  title,
  subtitle,
  image = defaultBeachImage,
  icon: Icon = Sparkles,
  children,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-800/80 flex flex-col justify-end p-4.5 sm:p-6 ${
        compact ? 'min-h-[145px] mb-3.5' : 'min-h-[175px] sm:min-h-[200px] mb-4'
      } ${className}`}
    >
      {/* Background Beach Photo */}
      {image && (
        <img
          src={image}
          alt="Beach Background"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
      )}

      {/* Sleek Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40" />

      {/* Banner Content */}
      <div className="relative z-10 space-y-1">
        {badge && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 drop-shadow-sm">
            {Icon && <Icon className="h-3.5 w-3.5 text-amber-300" />}
            <span>{badge}</span>
          </div>
        )}
        {title && (
          <h1 className="text-lg font-extrabold leading-snug sm:text-2xl text-white drop-shadow-md">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow-xs leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  );
}
