import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Waves, Users, Ticket, ArrowLeft } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';
import Button from '../../components/ui/Button.jsx';

const INSTRUCTIONS = [
  'instruction.noLitter',
  'instruction.useBins',
  'instruction.keepClean',
  'instruction.noNoise',
  'instruction.driveSafe',
  'instruction.respectVisitors',
  'instruction.followSecurity',
];

export default function EntrySuccess() {
  const { t } = useTranslation();
  const location = useLocation();
  const entry = location.state?.entry;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans pb-12">
      {/* Decorative Wave Background Gradient */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl" />

      {/* Top Mobile Header */}
      <MobileHeader
        title={t('app.title', 'Smart Beach')}
        showLanguage
      />

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-lg space-y-6 px-4 pt-2">
        {/* Success Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-xl shadow-slate-200/60 border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 animate-pulse">
            <CheckCircle2 className="h-12 w-12 stroke-[2]" />
          </div>

          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight">
              {t('beach.entryRegistered', 'ENTRY REGISTERED')}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {t('beach.proceedEntrance', 'Please proceed to the entrance')}
            </p>
          </div>

          {/* Ticket Details Summary if passed */}
          {entry && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users className="h-4 w-4 text-emerald-600" />
                  {t('beach.visitorCount', 'Visitors')}:
                </span>
                <span className="text-sm font-bold text-slate-900">{entry.visitorCount || 1}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Ticket className="h-4 w-4 text-emerald-600" />
                  {t('beach.totalAmount', 'Total Offline Fee')}:
                </span>
                <span className="text-base font-black text-emerald-600">₹{(entry.visitorCount || 1) * 20}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
            {t('beach.thankYou', 'Thank you for keeping the beach clean')}
          </p>

          <div className="pt-2">
            <Link to="/entry">
              <Button variant="secondary" className="w-full gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                Register Another Entry
              </Button>
            </Link>
          </div>
        </div>

        {/* Safety Guidelines */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-medium text-slate-900 px-1">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            {t('beach.rulesTitle', 'Beach Rules & Safety')}
          </h2>

          <div className="space-y-2.5">
            {INSTRUCTIONS.map((key, index) => (
              <BeachInstructionCard key={key} instructionKey={key} index={index} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
