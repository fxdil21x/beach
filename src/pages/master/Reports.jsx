import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin, MonitorSmartphone } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function MasterReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    masterApi
      .getReports()
      .then(({ data }) => setReports(data.data.reports || []))
      .catch(() => setReports([]));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">{t('nav.reports')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Anonymous and user beach issue reports</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        {reports.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-500">
            {t('common.noResults')}
          </div>
        )}

        {reports.map((r) => {
          const hasLocation =
            r.location?.latitude != null && r.location?.longitude != null;
          const mapsUrl = hasLocation
            ? `https://www.google.com/maps?q=${r.location.latitude},${r.location.longitude}`
            : null;

          return (
            <div
              key={r._id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{t(`report.categories.${r.category}`)}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleString()}
                    {r.isAnonymous ? ` · ${t('report.anonymous')}` : ''}
                  </p>
                </div>
                <StatusBadge status={r.status} label={t(`report.status.${r.status}`)} />
              </div>

              {r.description ? (
                <p className="mt-3 text-sm text-zinc-300">{r.description}</p>
              ) : (
                <p className="mt-3 text-sm italic text-zinc-500">{t('report.noDescription')}</p>
              )}

              {r.photoUrl && (
                <a href={r.photoUrl} target="_blank" rel="noreferrer">
                  <img
                    src={r.photoUrl}
                    alt="Report"
                    className="mt-3 h-48 w-full rounded-xl object-cover"
                  />
                </a>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    {t('report.location')}
                  </div>
                  {hasLocation ? (
                    <>
                      <p className="text-zinc-400">
                        {r.location.latitude.toFixed(6)}, {r.location.longitude.toFixed(6)}
                      </p>
                      {r.location.accuracy != null && (
                        <p className="text-xs text-zinc-500">±{Math.round(r.location.accuracy)}m</p>
                      )}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-300"
                      >
                        {t('report.openMap')}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <p className="text-zinc-500">{t('report.locationUnavailable')}</p>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                    <MonitorSmartphone className="h-4 w-4 text-orange-400" />
                    {t('report.deviceDetails')}
                  </div>
                  {r.deviceInfo ? (
                    <dl className="space-y-1 text-xs text-zinc-400">
                      <div>
                        <dt className="inline font-medium text-zinc-300">Platform: </dt>
                        <dd className="inline">{r.deviceInfo.platform || '—'}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-zinc-300">Language: </dt>
                        <dd className="inline">{r.deviceInfo.language || '—'}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-zinc-300">Screen: </dt>
                        <dd className="inline">
                          {r.deviceInfo.screenWidth && r.deviceInfo.screenHeight
                            ? `${r.deviceInfo.screenWidth}×${r.deviceInfo.screenHeight}`
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-zinc-300">Timezone: </dt>
                        <dd className="inline">{r.deviceInfo.timezone || '—'}</dd>
                      </div>
                      <div className="break-all">
                        <dt className="inline font-medium text-zinc-300">UA: </dt>
                        <dd className="inline">{r.deviceInfo.userAgent || '—'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-zinc-500">{t('report.deviceUnavailable')}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
