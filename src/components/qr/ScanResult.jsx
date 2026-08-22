import { useTranslation } from 'react-i18next';
import ResidentPhoto from '../resident/ResidentPhoto.jsx';

export default function ScanResult({ result, onClose }) {
  const { t } = useTranslation();
  const granted = result?.valid && result?.status === 'GRANTED';
  const resident = result?.resident;
  const isVisitor = result?.type === 'VISITOR' || Boolean(result?.visitorEntry);

  /* ── colour tokens ── */
  const accent      = granted ? '#16a34a' : '#dc2626';
  const accentLight = granted ? '#dcfce7' : '#fee2e2';
  const accentText  = granted ? '#14532d' : '#7f1d1d';
  const bgGradient  = granted
    ? 'linear-gradient(160deg,#052e16 0%,#14532d 40%,#166534 100%)'
    : 'linear-gradient(160deg,#450a0a 0%,#7f1d1d 40%,#991b1b 100%)';

  const statusLabel = granted
    ? isVisitor ? t('admin.permissionGranted') : t('admin.userFound')
    : t('admin.permissionDenied');

  const subLabel = granted
    ? isVisitor ? 'Verified Visitor Entry' : t('admin.verifiedResident')
    : null;

  const badge = granted
    ? isVisitor
      ? { text: 'PAID ENTRY',          bg: '#bbf7d0', color: '#14532d' }
      : { text: t('admin.freeEntry'),   bg: '#bbf7d0', color: '#14532d' }
    : null;

  return (
    <div
      style={{ background: bgGradient, fontFamily: "'Inter', sans-serif" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-5 py-10"
    >
      {/* ambient glow */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 30%, ${accent}55 0%, transparent 65%)`,
        }}
      />

      {/* status icon ring */}
      <div
        style={{
          width: 80, height: 80, borderRadius: '50%', flexShrink: 0, zIndex: 1,
          background: `${accent}33`, border: `2px solid ${accent}88`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, backdropFilter: 'blur(6px)',
        }}
      >
        {granted ? (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
            stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
            stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>

      {/* headline */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ maxWidth: 380 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          {statusLabel}
        </h2>

        {subLabel && (
          <p style={{ marginTop: 6, color: '#d1fae5', fontSize: 14, fontWeight: 500 }}>
            {subLabel}
          </p>
        )}

        {badge && (
          <span style={{
            marginTop: 10, padding: '4px 14px', borderRadius: 999,
            background: badge.bg, color: badge.color,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
          }}>
            {badge.text}
          </span>
        )}

        {!granted && result?.reason && (
          <p style={{
            marginTop: 12, color: '#fca5a5', fontSize: 14, lineHeight: 1.5,
            background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px',
            backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)',
          }}>
            {result.reason}
          </p>
        )}
      </div>

      {/* ── resident card ── */}
      {resident && (
        <div style={{
          marginTop: 24, width: '100%', maxWidth: 380, borderRadius: 20, zIndex: 1,
          background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>
          {/* card header stripe */}
          <div style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={accentText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: accentText, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Resident Details
            </span>
          </div>

          <div style={{ padding: '20px 20px 16px' }}>
            {/* photo + name */}
            <div className="flex items-center gap-4" style={{ marginBottom: 18 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${accentLight}`, boxShadow: `0 4px 14px ${accent}44`,
              }}>
                <ResidentPhoto src={resident.photoUrl} alt={resident.name} className="h-full w-full" />
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{resident.name}</p>
                {result.entryLog?.checkedAt && (
                  <p style={{ marginTop: 4, fontSize: 11, color: '#9ca3af' }}>
                    {new Date(result.entryLog.checkedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* detail rows */}
            <div style={{ background: '#f9fafb', borderRadius: 12, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
              {[
                { label: t('resident.fatherName'), value: resident.guardianName },
                { label: t('resident.houseName'),  value: resident.houseName },
                resident.gender    ? { label: t('resident.gender'), value: resident.gender } : null,
                resident.age != null ? { label: 'Age', value: resident.age } : null,
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: '#111', fontWeight: 600 }}>{row.value || '—'}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── visitor card ── */}
      {result?.visitorEntry && (
        <div style={{
          marginTop: 20, width: '100%', maxWidth: 380, borderRadius: 20, zIndex: 1,
          background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>
          {/* header */}
          <div style={{
            background: `linear-gradient(90deg, ${accent}, ${accentLight})`,
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={accentText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: accentText, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Visitor Entry
            </span>
          </div>

          {/* 2-column stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#f3f4f6' }}>
            <div style={{ background: '#fff', padding: '18px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Visitors
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#111', lineHeight: 1.1, marginTop: 4 }}>
                {result.visitorEntry.visitorCount}
              </p>
            </div>
            <div style={{ background: '#fff', padding: '18px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Amount
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1.1, marginTop: 4 }}>
                ₹{result.visitorEntry.totalAmount}
              </p>
            </div>
          </div>

          {result.visitorEntry.scannedAt && (
            <p style={{
              padding: '10px 16px', textAlign: 'center', fontSize: 11,
              color: '#9ca3af', background: '#fff', borderTop: '1px solid #f3f4f6',
            }}>
              {new Date(result.visitorEntry.scannedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* close button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 28, padding: '14px 48px', borderRadius: 14, zIndex: 1,
          background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 16, fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
          cursor: 'pointer', letterSpacing: '0.2px', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
      >
        OK
      </button>
    </div>
  );
}
