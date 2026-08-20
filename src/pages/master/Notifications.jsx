import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Sparkles,
  Radio,
  MapPin,
  Compass,
  Zap,
  ShieldAlert,
  Car,
  Truck,
  Info,
  Gift,
  Star,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import MasterHeader from '../../components/layout/MasterHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { NotificationsSkeleton } from '../../components/ui/Skeleton.jsx';
import * as announcementApi from '../../api/announcementApi.js';

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: 'Feature' },
  { name: 'Radio', icon: Radio, label: 'Live Tracking' },
  { name: 'MapPin', icon: MapPin, label: 'Location' },
  { name: 'Compass', icon: Compass, label: 'Navigation' },
  { name: 'Zap', icon: Zap, label: 'Fast Action' },
  { name: 'Bell', icon: Bell, label: 'Alert' },
  { name: 'ShieldAlert', icon: ShieldAlert, label: 'Security' },
  { name: 'Car', icon: Car, label: 'Parking' },
  { name: 'Truck', icon: Truck, label: 'Bus / Transport' },
  { name: 'Info', icon: Info, label: 'Information' },
  { name: 'Gift', icon: Gift, label: 'Reward' },
  { name: 'Star', icon: Star, label: 'Special' },
];

export default function MasterNotifications() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: 'Radio',
    targetRole: 'all',
    badge: 'Coming Soon',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await announcementApi.getMasterAnnouncements();
      setAnnouncements(data.data.announcements || []);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await announcementApi.createAnnouncement(form);
      setSuccess('Feature announcement created successfully');
      setForm({
        title: '',
        description: '',
        icon: 'Radio',
        targetRole: 'all',
        badge: 'Coming Soon',
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await announcementApi.updateAnnouncement(item._id, { isActive: !item.isActive });
      fetchAnnouncements();
    } catch {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feature announcement?')) return;
    try {
      await announcementApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch {
      setError(t('common.error'));
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-900 text-zinc-100">
      <MasterHeader title={t('nav.notifications', 'Feature Announcements')} />

      <main className="space-y-6 p-6">
        {/* Top Banner */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Feature Notification Center</h2>
              <p className="text-sm text-zinc-400">
                Announce new upcoming features (like Live Tracking) to Users and Admins with custom icons & descriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
            <Plus className="h-5 w-5 text-orange-400" />
            {t('notifications.createTitle', 'Post Feature Announcement')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="rounded-xl bg-red-500/15 p-3 text-sm text-red-400">{error}</p>}
            {success && <p className="rounded-xl bg-green-500/15 p-3 text-sm text-green-400">{success}</p>}

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Feature Title"
                placeholder="e.g., Live Bus & Parking Tracking"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white"
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Badge Tag
                </label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-hidden"
                >
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="New Feature">New Feature</option>
                  <option value="Update">Update</option>
                  <option value="Important">Important</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                Feature Description (What's the use of this feature)
              </label>
              <textarea
                rows={3}
                placeholder="Explain what this feature will do and how it benefits users/admins..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Icon Selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-300">
                Choose Feature Icon
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {AVAILABLE_ICONS.map((item) => {
                  const IconC = item.icon;
                  const isSelected = form.icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setForm({ ...form, icon: item.name })}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/15 text-orange-400 shadow-sm'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <IconC className="h-5 w-5 mb-1" />
                      <span className="text-[11px] font-medium truncate w-full text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                Target Audience
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'all', label: 'All (Users & Admins)' },
                  { value: 'user', label: 'Users Only (Residents/Visitors)' },
                  { value: 'admin', label: 'Admins Only (Officials)' },
                ].map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="targetRole"
                      value={opt.value}
                      checked={form.targetRole === opt.value}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                      className="accent-orange-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600">
              {submitting ? t('common.loading') : 'Publish Feature Notification'}
            </Button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
          <h3 className="text-base font-bold text-white mb-4">Posted Feature Announcements</h3>

          {loading ? (
            <NotificationsSkeleton count={3} dark />
          ) : announcements.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No feature announcements posted yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400">
                        {item.icon}
                      </span>
                      <h4 className="text-base font-bold text-white truncate">{item.title}</h4>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>Target: <strong className="text-zinc-400 capitalize">{item.targetRole}</strong></span>
                      <span>•</span>
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        item.isActive
                          ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {item.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4" />}
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg bg-red-500/15 p-2 text-red-400 hover:bg-red-500/25 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
