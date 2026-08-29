import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun,
  Moon,
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  Save,
  Sliders,
} from 'lucide-react';

export const THEME_PRESETS = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    tag: 'Popular',
    accentColor: '#0284C7',
    accentSecondary: '#38BDF8',
    glowColor: 'rgba(2, 132, 199, 0.35)',
    bgColor: '#090A0F',
    cardBgColor: '#121214',
  },
  {
    id: 'sunset-beach',
    name: 'Sunset Beach',
    tag: 'Default',
    accentColor: '#EA580C',
    accentSecondary: '#F59E0B',
    glowColor: 'rgba(234, 88, 12, 0.35)',
    bgColor: '#0F0B08',
    cardBgColor: '#1A1410',
  },
  {
    id: 'emerald-coast',
    name: 'Emerald Coast',
    tag: 'Fresh',
    accentColor: '#059669',
    accentSecondary: '#14B8A6',
    glowColor: 'rgba(5, 150, 105, 0.35)',
    bgColor: '#06130E',
    cardBgColor: '#0D211A',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    tag: 'Vibrant',
    accentColor: '#7C3AED',
    accentSecondary: '#A78BFA',
    glowColor: 'rgba(124, 58, 237, 0.35)',
    bgColor: '#0C0A14',
    cardBgColor: '#161224',
  },
  {
    id: 'coral-rose',
    name: 'Coral Rose',
    tag: 'Warm',
    accentColor: '#E11D48',
    accentSecondary: '#FB7185',
    glowColor: 'rgba(225, 29, 72, 0.35)',
    bgColor: '#14080B',
    cardBgColor: '#200F14',
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    tag: 'Luxury',
    accentColor: '#D97706',
    accentSecondary: '#FBBF24',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    bgColor: '#110D06',
    cardBgColor: '#1C160B',
  },
];

const ACCENT_PILLS = [
  { id: 'ocean-blue', name: 'Ocean Blue', color: '#0284C7' },
  { id: 'sky-cyan', name: 'Sky Cyan', color: '#06B6D4' },
  { id: 'sunset-orange', name: 'Sunset Orange', color: '#EA580C' },
  { id: 'emerald-coast', name: 'Emerald Coast', color: '#059669' },
  { id: 'royal-purple', name: 'Royal Purple', color: '#7C3AED' },
  { id: 'coral-rose', name: 'Coral Rose', color: '#E11D48' },
  { id: 'golden-amber', name: 'Golden Amber', color: '#D97706' },
  { id: 'teal-lagoon', name: 'Teal Lagoon', color: '#0D9488' },
];

export default function ThemeColorCustomizer({
  activeTab = 'user',
  themeSettings,
  onChangeTheme,
  onSave,
  onReset,
  isSaving = false,
  isLoading = false,
}) {
  const { t } = useTranslation();

  const handleModeChange = (mode) => {
    const updated = {
      ...themeSettings,
      themeMode: mode,
    };
    if (mode === 'light') {
      updated.bgColor = '#F8FAFC';
      updated.cardBgColor = '#FFFFFF';
    } else {
      const activePreset = THEME_PRESETS.find((p) => p.id === themeSettings.presetId) || THEME_PRESETS[0];
      updated.bgColor = activePreset.bgColor;
      updated.cardBgColor = activePreset.cardBgColor;
    }
    onChangeTheme(updated);
  };

  const handlePresetSelect = (preset) => {
    const isLight = themeSettings.themeMode === 'light';
    const updated = {
      ...themeSettings,
      presetId: preset.id,
      accentColor: preset.accentColor,
      accentSecondary: preset.accentSecondary,
      glowColor: preset.glowColor,
      bgColor: isLight ? '#F8FAFC' : preset.bgColor,
      cardBgColor: isLight ? '#FFFFFF' : preset.cardBgColor,
    };
    onChangeTheme(updated);
  };

  const handleColorChange = (key, value) => {
    onChangeTheme({
      ...themeSettings,
      [key]: value,
    });
  };

  const isLight = themeSettings.themeMode === 'light';
  const activeColor = themeSettings.accentColor || '#7C3AED';

  return (
    <div className="space-y-5">
      {/* 1. Header Banner Card with Title and Actions */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-colors"
              style={{ backgroundColor: activeColor }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {activeTab === 'user' ? 'User Mobile App Customizer' : 'Admin Portal Customizer'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure Light/Dark mode and live brand colors with instant preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/60 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: activeColor }}
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Screen Mode (Light vs Dark) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xl">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Screen Mode (Light vs Dark)</h3>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {isLight ? '☀️ Light Mode' : '🌙 Dark Mode (OLED Black)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModeChange('light')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all cursor-pointer ${
              isLight
                ? 'border-blue-500 bg-zinc-800/90 text-white shadow-md ring-2 ring-blue-500/20'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <Sun className="h-4 w-4 text-amber-400" />
            <span>Light Mode (White BG - Default)</span>
            {isLight && <Check className="ml-1.5 h-4 w-4 text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('dark')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all cursor-pointer ${
              !isLight
                ? 'border-blue-500 bg-zinc-800/90 text-white shadow-md ring-2 ring-blue-500/20'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <Moon className="h-4 w-4 text-blue-400" />
            <span>Dark Mode (AMOLED Black)</span>
            {!isLight && <Check className="ml-1.5 h-4 w-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* 3. Color Palettes & Presets */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xl">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Color Palettes & Presets</h3>
          </div>
          <span className="text-xs text-zinc-500">Click to apply palette</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = themeSettings.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-zinc-800/80 shadow-md ring-2 ring-blue-500/20'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: preset.accentSecondary }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{preset.name}</p>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-zinc-500 font-medium mt-0.5">{preset.tag}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Primary Brand Accent */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Primary Brand Accent</h3>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
            {themeSettings.accentColor || '#7C3AED'}
          </span>
        </div>

        {/* Quick Accent Pills */}
        <div className="flex flex-wrap gap-2">
          {ACCENT_PILLS.map((pill) => {
            const isSelected = (themeSettings.accentColor || '').toLowerCase() === pill.color.toLowerCase();
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleColorChange('accentColor', pill.color)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border border-white/40 bg-zinc-800 text-white shadow-xs ring-1 ring-white/20'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: pill.color }}
                />
                <span>{pill.name}</span>
                {isSelected && <Check className="h-3 w-3 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* HEX Input Field */}
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2">
          <span className="text-xs font-bold text-zinc-500 shrink-0">HEX</span>
          <input
            type="text"
            value={themeSettings.accentColor || '#7C3AED'}
            onChange={(e) => handleColorChange('accentColor', e.target.value)}
            className="flex-1 bg-transparent text-xs font-mono font-bold text-white uppercase focus:outline-none"
            placeholder="#7C3AED"
          />
          <div
            className="h-6 w-6 rounded-md shadow-xs shrink-0 border border-white/10"
            style={{ backgroundColor: themeSettings.accentColor || '#7C3AED' }}
          />
        </div>
      </div>
    </div>
  );
}
