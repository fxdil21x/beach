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
  Utensils,
  Hotel,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { NotificationsSkeleton } from '../../components/ui/Skeleton.jsx';
import * as announcementApi from '../../api/announcementApi.js';

const AVAILABLE_ICONS = [
  {
    name: 'Bell',
    icon: Bell,
    label: 'Emergency Alarm',
    defaultTitle: 'Emergency SOS Alarm & Fast Rescue',
    defaultDescription: 'In an emergency? Click the red SOS Alarm button to sound an alert tone on nearby safety officer devices and instantly send your live GPS location so beach admins can dispatch help immediately.',
  },
  {
    name: 'ShieldAlert',
    icon: ShieldAlert,
    label: 'Security & SOS',
    defaultTitle: '24/7 Security Patrol & Emergency Assistance',
    defaultDescription: 'Rest easy knowing 24/7 beach security officers and emergency response teams are on standby to assist you at any moment.',
  },
  {
    name: 'Utensils',
    icon: Utensils,
    label: 'Order Food',
    defaultTitle: 'Order Food & Drinks to Your Beach Spot',
    defaultDescription: 'Craving delicious snacks or cold beverages on the sand? Order online from beach restaurants and get food delivered right to your beach location.',
  },
  {
    name: 'Hotel',
    icon: Hotel,
    label: 'Resort Booking',
    defaultTitle: 'Book Nearby Beach Resorts & Rooms',
    defaultDescription: 'Planning an overnight trip? Browse top luxury resorts near Muzhappilangad beach, check room availability, and book your stay in seconds.',
  },
  {
    name: 'Radio',
    icon: Radio,
    label: 'Live Tracking',
    defaultTitle: 'Live GPS Location Sharing for Safety',
    defaultDescription: 'Enable live GPS location sharing so lifeguard teams and beach admins can locate you instantly during emergencies or high tide alerts.',
  },
  {
    name: 'MapPin',
    icon: MapPin,
    label: 'Location',
    defaultTitle: 'Interactive Beach Facilities & Map',
    defaultDescription: 'Locate restrooms, emergency posts, food stalls, and scenic viewpoints around Muzhappilangad drive-in beach on the map.',
  },
  {
    name: 'Compass',
    icon: Compass,
    label: 'Navigation',
    defaultTitle: 'Beach Entry Directions & Route Map',
    defaultDescription: 'Get instant turn-by-turn driving and walking directions to the nearest beach entrances and parking gates.',
  },
  {
    name: 'Zap',
    icon: Zap,
    label: 'Fast Action',
    defaultTitle: 'Express Digital QR Beach Pass',
    defaultDescription: 'Show your digital QR pass at gate scanners to skip the long waiting lines and enjoy fast-track entry to the beach drive.',
  },
  {
    name: 'Car',
    icon: Car,
    label: 'Parking',
    defaultTitle: 'Live Vehicle Parking Availability',
    defaultDescription: 'Check real-time parking slot availability at all beach gates before arriving so you can park smoothly without hassle.',
  },
  {
    name: 'Truck',
    icon: Truck,
    label: 'Transport',
    defaultTitle: 'Beach Shuttle & Electric Ride Service',
    defaultDescription: 'Hop on eco-friendly shuttle buggies operating along the beach drive. Check routes and live arrival times in the app.',
  },
  {
    name: 'Info',
    icon: Info,
    label: 'Information',
    defaultTitle: 'Important Visitor Guidelines & High Tide Info',
    defaultDescription: 'Stay updated on daily beach opening hours, high tide advisory warnings, vehicle driving rules, and visitor safety instructions.',
  },
  {
    name: 'Gift',
    icon: Gift,
    label: 'Special',
    defaultTitle: 'Exclusive Discounts & Water Sports Offers',
    defaultDescription: 'Unlock special seasonal discounts and promotional deals on beach activities, food stalls, and resort stay packages.',
  },
  {
    name: 'Star',
    icon: Star,
    label: 'Important',
    defaultTitle: 'New App Upgrade Released',
    defaultDescription: 'We upgraded the beach portal with new tools designed to make your beach visit safer, faster, and more enjoyable!',
  },
  {
    name: 'Sparkles',
    icon: Sparkles,
    label: 'Feature',
    defaultTitle: 'New Feature Announcement',
    defaultDescription: "We launched a brand new feature for beach visitors! Explore the app dashboard to try out the new tools today.",
  },
];

const ICON_MAP = Object.fromEntries(AVAILABLE_ICONS.map((i) => [i.name, i.icon]));

export default function MasterNotifications() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('Coming Soon');
  const [selectedIcon, setSelectedIcon] = useState('Bell');

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementApi.getMasterAnnouncements();
      setAnnouncements(data.data.announcements || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSelectIcon = (item) => {
    setSelectedIcon(item.name);
    if (item.defaultTitle) {
      setTitle(item.defaultTitle);
    }
    if (item.defaultDescription) {
      setDescription(item.defaultDescription);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError(t('common.requiredFields', 'Please fill in title and description'));
      return;
    }

    setSubmitting(true);
    try {
      await announcementApi.createAnnouncement({
        title,
        description,
        badgeText,
        iconName: selectedIcon,
      });
      setSuccess(t('notifications.created', 'Announcement created successfully!'));
      setTitle('');
      setDescription('');
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await announcementApi.updateAnnouncement(id, { isActive: !currentStatus });
      fetchAnnouncements();
    } catch {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete', 'Delete this announcement?'))) return;
    try {
      await announcementApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch {
      setError(t('common.error'));
    }
  };

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="h-6 w-6 text-orange-400 shrink-0" />
          <span>{t('nav.notifications', 'Feature Announcements')}</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Announce new upcoming features (like Live Tracking) to Users and Admins with custom icons & descriptions.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm font-medium text-emerald-300">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      {/* Create Form */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-white mb-4">
          <Plus className="h-5 w-5 text-orange-400" />
          {t('notifications.createTitle', 'Post Feature Announcement')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                {t('notifications.featureTitle', 'Feature Title')} *
              </label>
              <Input
                type="text"
                placeholder="e.g., Emergency SOS Alarm & Fast Rescue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                {t('notifications.badgeTag', 'Badge Tag')}
              </label>
              <select
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200 focus:border-orange-500 focus:outline-none"
              >
                <option value="Coming Soon">Coming Soon</option>
                <option value="New Feature">New Feature</option>
                <option value="Beta">Beta</option>
                <option value="Update">Update</option>
                <option value="Important">Important</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              {t('notifications.featureDesc', "Feature Description (Public Purpose & How It Helps Visitors)")} *
            </label>
            <textarea
              rows={3}
              placeholder="Explain how this feature helps public visitors and what happens when they use it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-orange-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              {t('notifications.chooseIcon', 'Choose Feature Icon')}
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectIcon(item)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                      isSelected
                        ? 'border-2 border-orange-500 bg-orange-500/20 text-orange-400 shadow-md'
                        : 'border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                    title={item.label}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="mt-1 truncate text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading', 'Posting...') : t('notifications.postButton', 'Post Announcement')}
            </Button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          {t('notifications.existingTitle', 'Active & Draft Announcements')} ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 text-center text-zinc-400">
            {t('notifications.noAnnouncements', 'No feature announcements posted yet.')}
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((item) => {
              const IconComp = ICON_MAP[item.iconName] || Sparkles;
              return (
                <div
                  key={item._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
                    item.isActive
                      ? 'border-zinc-800 bg-zinc-900/90'
                      : 'border-zinc-800/50 bg-zinc-950/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/20">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{item.title}</h4>
                        <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-500/30">
                          {item.badgeText}
                        </span>
                        {!item.isActive && (
                          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                        item.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-400" /> Visible
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-zinc-500" /> Hidden
                        </>
                      )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
