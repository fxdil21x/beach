import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Waves,
  ShieldCheck,
  Compass,
  ArrowRight,
  Info,
  Sparkles,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';
import VisitorCounter from '../../components/beach/VisitorCounter.jsx';
import Button from '../../components/ui/Button.jsx';
import { changeLanguage } from '../../i18n/i18n.js';
import * as visitorApi from '../../api/visitorApi.js';
import heroBannerImage from './image/Gemini_Generated_Image_kxdt3pkxdt3pkxdt.png';

const INSTRUCTIONS = [
  'instruction.noLitter',
  'instruction.useBins',
  'instruction.keepClean',
  'instruction.noNoise',
  'instruction.driveSafe',
  'instruction.respectVisitors',
  'instruction.followSecurity',
];

export default function VisitorEntry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    changeLanguage(localStorage.getItem('beach_app_language') || 'ml');
  }, []);

  const idempotencyKey = useState(() => crypto.randomUUID())[0];

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitting(true);
    try {
      const { data } = await visitorApi.submitEntry({ visitorCount: count, idempotencyKey });
      setSubmitted(true);
      navigate('/entry/success', { state: { entry: data.data } });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans pb-12">
      {/* Decorative Wave Background Gradient Elements */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl bg-gradient-to-b from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

      {/* Top Mobile Header */}
      <MobileHeader
        title={t('app.title', 'Smart Beach')}
        showLanguage
      />

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-lg space-y-6 px-4 pt-2">
        {/* Hero Header Card with Background Image */}
        <div className="relative min-h-[240px] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-900/25 border border-slate-800 flex flex-col justify-end p-6 sm:p-7">
          {/* Hero Image Background with Sleek Dark Gradient Overlay */}
          <img
            src={heroBannerImage}
            alt="Muzhappilangad Smart Beach Banner"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40" />

          {/* Banner Content */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-1 text-xs sm:text-sm font-bold text-cyan-200 backdrop-blur-md shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('beach.location', 'Kannur, Kerala')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-white drop-shadow-md">
              {t('beach.welcome', 'Welcome to Muzhappilangad Beach')}
            </h1>

            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium drop-shadow-sm">
              {t('beach.name', 'Muzhappilangad Beach')} — Asia's premier drive-in beach entrance system.
            </p>

            <div className="pt-3 flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-semibold border-t border-white/20">
              <span className="flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-cyan-300" /> ₹20 / Person
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-cyan-300" /> Offline Gate Payment
              </span>
            </div>
          </div>
        </div>

        {/* Visitor Group Counter Block */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <VisitorCounter value={count} onChange={setCount} pricePerPerson={20} />
        </section>

        {/* Beach Rules & Safety Instructions */}
        <section className="space-y-3">
          <div className="flex items-center px-1">
            <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              <ShieldCheck className="h-5 w-5 text-cyan-600 shrink-0" />
              <span>{t('beach.rulesTitle', 'Beach Rules & Safety')}</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {INSTRUCTIONS.map((key, index) => (
              <BeachInstructionCard key={key} instructionKey={key} index={index} />
            ))}
          </div>
        </section>

        {/* Submit & Fee Confirmation Banner */}
        <section className="space-y-3.5 pt-2">
          <div className="rounded-2xl border border-cyan-200/90 bg-cyan-50/90 p-4 sm:p-5 text-center text-sm sm:text-base text-cyan-950 shadow-xs backdrop-blur-xs">
            <p className="font-semibold leading-relaxed">
              {t('visitor.feeInfo', { amount: 20 })}
            </p>
            <p className="mt-1 font-bold text-cyan-800">
              {t('visitor.confirmEntry')}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 py-4 sm:py-4.5 text-lg sm:text-xl font-black text-white shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-500 hover:to-indigo-500 hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('common.loading', 'Registering...')}</span>
              </div>
            ) : (
              <>
                <span>{t('beach.getEntry', 'GET ENTRY')}</span>
                <ArrowRight className="h-5.5 w-5.5 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </section>
      </main>
    </div>
  );
}
