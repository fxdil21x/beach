import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/language/LanguageSwitcher.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';
import VisitorCounter from '../../components/beach/VisitorCounter.jsx';
import Button from '../../components/ui/Button.jsx';
import { changeLanguage } from '../../i18n/i18n.js';
import * as visitorApi from '../../api/visitorApi.js';

const INSTRUCTIONS = [
  'instruction.noLitter', 'instruction.useBins', 'instruction.keepClean',
  'instruction.noNoise', 'instruction.driveSafe', 'instruction.respectVisitors', 'instruction.followSecurity',
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
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-8">
      <div className="flex justify-end p-4"><LanguageSwitcher /></div>
      <main className="mx-auto max-w-lg space-y-5 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('beach.welcome')}</h1>
          <p className="text-gray-600">{t('beach.name')}</p>
        </div>
        <h2 className="text-lg font-semibold">{t('beach.rulesTitle')}</h2>
        {INSTRUCTIONS.map((key) => <BeachInstructionCard key={key} instructionKey={key} />)}
        <VisitorCounter value={count} onChange={setCount} />
        <p className="text-center text-gray-700">{t('visitor.feeInfo', { amount: 20 })}</p>
        <p className="text-center text-sm text-gray-500">{t('visitor.confirmEntry')}</p>
        <Button onClick={handleSubmit} disabled={submitting || submitted} className="w-full py-5 text-xl">
          {submitting ? t('common.loading') : t('beach.getEntry')}
        </Button>
      </main>
    </div>
  );
}
