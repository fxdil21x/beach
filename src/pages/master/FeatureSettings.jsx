import { useState } from 'react';
import { Sliders, Siren, ShieldAlert, FileText, MapPin, CheckCircle2, AlertCircle, Loader2, Utensils, Hotel } from 'lucide-react';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import Button from '../../components/ui/Button.jsx';

export default function MasterFeatureSettings() {
  const { featureSettings, updateFeatures } = useFeatureSettings();
  const [settings, setSettings] = useState({ ...featureSettings });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await updateFeatures(settings);
      setSuccess('Feature control settings saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feature settings');
    } finally {
      setSaving(false);
    }
  };

  const featureCards = [
    {
      key: 'emergencySosEnabled',
      title: 'Emergency SOS Alarm Button',
      icon: Siren,
      accent: 'bg-red-500/15 text-red-400 border-red-500/20',
      description: (
        <>
          Shows the red Emergency SOS button on user home. This button is strictly visible <strong>only to logged-in users</strong> when this toggle is ON. If disabled, no user can trigger emergency alarm sounds.
        </>
      ),
    },
    {
      key: 'publicReportEnabled',
      title: 'Public Visitor Issue Reporting',
      icon: FileText,
      accent: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      description: (
        <>
          Controls the "Report Issue" button and submission route for non-logged-in public/guest visitors. If OFF, the report button will be hidden from guests on public pages.
        </>
      ),
    },
    {
      key: 'userReportEnabled',
      title: 'Logged-In User Issue Reporting',
      icon: ShieldAlert,
      accent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      description: (
        <>
          Controls the "Report Issue" button and link for logged-in residents/users. If OFF, the report button will be hidden for logged-in users on their dashboard.
        </>
      ),
    },
    {
      key: 'trackUserEnabled',
      title: 'Track User System (Live GPS Location)',
      icon: MapPin,
      accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      description: (
        <div className="space-y-2">
          <p>
            Controls the live user location tracking system. When <strong>ON</strong>, visitors and residents see a location permission prompt on login/entry and stream live GPS coordinates to the Master Admin Live Map. When <strong>OFF</strong>, tracking is disabled.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('test-location-prompt'))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              Preview / Test Consent Modal
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'orderFoodEnabled',
      title: 'Order Food & Drinks Online',
      icon: Utensils,
      accent: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
      description: (
        <>
          Controls the <strong>"Order Food"</strong> system for beach visitors. When <strong>ON</strong>, visitors can browse restaurant menus and order food delivered directly to their beach location. When <strong>OFF</strong>, food ordering is hidden across the application.
        </>
      ),
    },
    {
      key: 'resortBookingEnabled',
      title: 'Resort & Stay Room Booking',
      icon: Hotel,
      accent: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      description: (
        <>
          Controls the <strong>"Resort Booking"</strong> system. When <strong>ON</strong>, visitors can browse nearby luxury beach resorts and book room stays. When <strong>OFF</strong>, resort booking is hidden across the application.
        </>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-400 shrink-0" />
            <span>Feature Controls & Visibility</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enable or disable specific client-side features for public visitors and logged-in users.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
        </Button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-start sm:items-center gap-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-3.5 sm:p-4 text-emerald-300 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-snug">{success}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-start sm:items-center gap-3 rounded-2xl bg-red-500/20 border border-red-500/30 p-3.5 sm:p-4 text-red-300 text-xs sm:text-sm font-semibold animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Feature Cards List */}
      <div className="space-y-3.5 sm:space-y-4">
        {featureCards.map((card) => {
          const Icon = card.icon;
          const isEnabled = settings[card.key] ?? true;

          return (
            <div
              key={card.key}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 sm:p-5 shadow-xl transition-all hover:border-zinc-700/80"
            >
              {/* Card Header Row */}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${card.accent} border mt-0.5 shadow-inner`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight">
                        {card.title}
                      </h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                        isEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {isEnabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Aligned Toggle Switch */}
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(card.key)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Description Paragraph */}
              <p className="mt-2.5 sm:mt-3 text-xs text-zinc-400 leading-relaxed sm:pl-[52px]">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
