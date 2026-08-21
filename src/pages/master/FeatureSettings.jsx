import { useState } from 'react';
import { Sliders, Siren, ShieldAlert, FileText, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-400" />
            Feature Controls & Visibility
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enable or disable specific client-side features for public visitors and logged-in users.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-4 text-emerald-300 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 border border-red-500/30 p-4 text-red-300 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="space-y-4">
        {/* Card 1: Emergency SOS Feature */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl transition-all hover:border-zinc-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-400 border border-red-500/20">
                <Siren className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Emergency SOS Alarm Button</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    settings.emergencySosEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {settings.emergencySosEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Shows the red Emergency SOS button on user home. This button is strictly visible <strong>only to logged-in users</strong> when this toggle is ON. If disabled, no user can trigger emergency alarm sounds.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => handleToggle('emergencySosEnabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.emergencySosEnabled ? 'bg-orange-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.emergencySosEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 2: Public Issue Reporting */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl transition-all hover:border-zinc-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Public Visitor Issue Reporting</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    settings.publicReportEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {settings.publicReportEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Controls the "Report Issue" button and submission route for non-logged-in public/guest visitors. If OFF, the report button will be hidden from guests on public pages.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => handleToggle('publicReportEnabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.publicReportEnabled ? 'bg-orange-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.publicReportEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 3: User/Resident Issue Reporting */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl transition-all hover:border-zinc-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Logged-In User Issue Reporting</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    settings.userReportEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {settings.userReportEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Controls the "Report Issue" button and link for logged-in residents/users. If OFF, the report button will be hidden for logged-in users on their dashboard.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => handleToggle('userReportEnabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.userReportEnabled ? 'bg-orange-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.userReportEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 4: Track User System */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl transition-all hover:border-zinc-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Track User System (Live GPS Location)</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    settings.trackUserEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {settings.trackUserEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Controls the live user location tracking system. When <strong>ON</strong>, registered users see a location permission prompt on login and stream live GPS coordinates to the Master Admin Live Map. When <strong>OFF</strong>, no location messages appear, tracking is disabled, and the "Track User" tab is hidden.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => handleToggle('trackUserEnabled')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.trackUserEnabled ? 'bg-orange-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.trackUserEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
