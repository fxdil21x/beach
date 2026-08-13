import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/language/LanguageSwitcher.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-8">
      <div className="flex justify-end p-4"><LanguageSwitcher /></div>
      <main className="mx-auto max-w-lg space-y-5 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('beach.entryRegistered')}</h1>
          <p className="text-gray-600">{t('beach.thankYou')}</p>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{t('beach.rulesTitle')}</h2>
        {INSTRUCTIONS.map((key) => <BeachInstructionCard key={key} instructionKey={key} />)}
      </main>
    </div>
  );
}
