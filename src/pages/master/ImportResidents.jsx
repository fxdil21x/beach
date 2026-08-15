import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import JsonFileIcon from '../../components/ui/JsonFileIcon.jsx';
import * as masterApi from '../../api/masterApi.js';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseFilePreview(data) {
  if (Array.isArray(data)) {
    return { voterCount: data.length, metadata: null };
  }
  if (data && typeof data === 'object') {
    const voters = data.voters ?? data.records;
    if (Array.isArray(voters)) {
      return { voterCount: voters.length, metadata: data.metadata ?? null };
    }
  }
  return null;
}

function getImportStatus(summary) {
  if (!summary.importedRecords && summary.failedRecords?.length) return 'failed';
  if (summary.failedRecords?.length || summary.duplicateRecords) return 'partial';
  return 'success';
}

const METADATA_LABELS = [
  { key: 'district', labelKey: 'master.importDistrict' },
  { key: 'local_body', labelKey: 'master.importLocalBody' },
  { key: 'ward', labelKey: 'master.importWard' },
  { key: 'polling_station', labelKey: 'master.importPollingStation' },
  { key: 'block_ward', labelKey: 'master.importBlockWard' },
  { key: 'district_ward', labelKey: 'master.importDistrictWard' },
];

export default function ImportResidents() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setSummary(null);
    setError('');

    if (!selectedFile) {
      setPreview(null);
      return;
    }

    try {
      const data = JSON.parse(await selectedFile.text());
      const parsed = parseFilePreview(data);
      if (!parsed) {
        setPreview({ invalid: true, fileName: selectedFile.name, fileSize: selectedFile.size });
        return;
      }
      setPreview({
        ...parsed,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });
    } catch {
      setPreview({ invalid: true, fileName: selectedFile.name, fileSize: selectedFile.size });
    }
  };

  const handleImport = async () => {
    if (!file || preview?.invalid) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await masterApi.importResidents(file);
      setSummary(data.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSummary(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const status = summary ? getImportStatus(summary) : null;

  return (
    <div className="min-h-0 max-w-4xl flex-1 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('master.importTitle')}</h1>
        <p className="mt-2 text-zinc-400">{t('master.importHint')}</p>
      </div>

   

      {!summary && (
        <div
          className={`mb-6 rounded-2xl border-2 border-dashed bg-zinc-900/80 p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-orange-500/10' : 'border-zinc-700'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped?.name.endsWith('.json')) handleFile(dropped);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />

          {!file ? (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/10">
                <JsonFileIcon className="h-12 w-12" />
              </div>
              <p className="mb-1 text-lg font-medium text-white">{t('master.importDropTitle')}</p>
              <p className="mb-1 text-sm font-medium text-orange-300">.json {t('master.importJsonOnly')}</p>
              <p className="mb-4 text-sm text-zinc-500">{t('master.importDropHint')}</p>
              <Button onClick={() => fileInputRef.current?.click()}>{t('master.importChooseFile')}</Button>
            </>
          ) : (
            <div className="text-left">
              <div className="flex items-start gap-4 rounded-xl bg-zinc-950/60 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                  <JsonFileIcon className="h-9 w-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{preview?.fileName || file.name}</p>
                  <p className="text-sm text-zinc-500">
                    {formatFileSize(preview?.fileSize || file.size)} · JSON
                  </p>
                </div>
                <button type="button" onClick={handleReset} className="shrink-0 text-sm text-rose-400 hover:underline">
                  {t('master.importRemoveFile')}
                </button>
              </div>

              {preview?.invalid ? (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  {t('master.importInvalidFile')}
                </div>
              ) : preview && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                      {t('master.importVoterCount', { count: preview.voterCount })}
                    </span>
                    {preview.metadata?.ward && (
                      <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm font-medium text-sky-300">
                        {preview.metadata.ward}
                      </span>
                    )}
                    {preview.metadata?.district && (
                      <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-medium text-violet-300">
                        {preview.metadata.district}
                      </span>
                    )}
                  </div>

                  {preview.metadata && (
                    <dl className="grid gap-2 rounded-xl border border-zinc-800 p-4 text-sm sm:grid-cols-2">
                      {METADATA_LABELS.map(({ key, labelKey }) =>
                        preview.metadata[key] ? (
                          <div key={key}>
                            <dt className="text-zinc-500">{t(labelKey)}</dt>
                            <dd className="font-medium text-white">{preview.metadata[key]}</dd>
                          </div>
                        ) : null
                      )}
                    </dl>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleImport}
                  disabled={!file || loading || preview?.invalid}
                  className="min-w-[200px] px-8 py-3 text-base"
                >
                  {loading ? t('master.importProcessing') : t('master.importStart')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          <p className="font-semibold">{t('master.importFailed')}</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          <div
            className={`rounded-2xl border p-6 ${
              status === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : status === 'partial'
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
            }`}
          >
            <p className="text-lg font-bold text-white">
              {status === 'success' && t('master.importSuccessTitle')}
              {status === 'partial' && t('master.importPartialTitle')}
              {status === 'failed' && t('master.importFailedTitle')}
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {t('master.importSuccessDesc', {
                imported: summary.importedRecords,
                total: summary.totalRecords,
              })}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('master.totalRecords'), value: summary.totalRecords, color: 'text-white', bg: 'bg-zinc-900/80' },
              { label: t('master.importedRecords'), value: summary.importedRecords, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: t('master.duplicateRecords'), value: summary.duplicateRecords, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: t('master.failedRecords'), value: summary.failedRecords?.length || 0, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-5 shadow-sm ${item.bg}`}>
                <p className="text-sm text-zinc-500">{item.label}</p>
                <p className={`mt-2 text-3xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {summary.metadata && (
            <div className="rounded-2xl bg-zinc-900/80 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">{t('master.importedArea')}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {METADATA_LABELS.map(({ key, labelKey }) =>
                  summary.metadata[key] ? (
                    <div key={key} className="rounded-xl bg-zinc-950/60 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t(labelKey)}</dt>
                      <dd className="mt-1 font-semibold text-white">{summary.metadata[key]}</dd>
                    </div>
                  ) : null
                )}
              </dl>
            </div>
          )}

          {summary.failedRecords?.length > 0 && (
            <div className="rounded-2xl bg-zinc-900/80 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-rose-300">{t('master.importFailedList')}</h2>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b bg-zinc-950/60">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">{t('auth.name')}</th>
                      <th className="p-3">Sec ID</th>
                      <th className="p-3">{t('master.importErrorReason')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.failedRecords.slice(0, 50).map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{item.index + 1}</td>
                        <td className="p-3">{item.record?.name || '—'}</td>
                        <td className="p-3">{item.record?.newSecIdNo || '—'}</td>
                        <td className="p-3 text-rose-400">{item.errors?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {summary.failedRecords.length > 50 && (
                  <p className="mt-2 text-sm text-zinc-500">
                    {t('master.importFailedMore', { count: summary.failedRecords.length - 50 })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {summary.importedRecords > 0 && (
              <Link
                to="/master/resident-records"
                className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              >
                {t('master.importViewRecords')} →
              </Link>
            )}
            <Button variant="secondary" onClick={handleReset}>
              {t('master.importAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
