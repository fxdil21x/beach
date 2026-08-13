import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as masterApi from '../../api/masterApi.js';

export default function AuditLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    masterApi.getAuditLogs().then(({ data }) => setLogs(data.data.logs)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('nav.auditLogs')}</h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50"><tr><th className="p-3">Action</th><th className="p-3">By</th><th className="p-3">Role</th><th className="p-3">Time</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-b">
                <td className="p-3">{l.action}</td>
                <td className="p-3">{l.performedBy?.name || 'System'}</td>
                <td className="p-3">{l.role}</td>
                <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
