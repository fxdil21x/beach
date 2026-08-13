import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';
import { userNav } from '../../config/navigation.js';

const INSTRUCTIONS = [
  'instruction.noLitter',
  'instruction.useBins',
  'instruction.keepClean',
  'instruction.noNoise',
  'instruction.driveSafe',
  'instruction.respectVisitors',
  'instruction.followSecurity',
];

export default function BeachRules() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('nav.beachRules')} showLanguage />
      <main className="space-y-3 px-4 py-6">
        <h2 className="text-xl font-bold">{t('beach.rulesTitle')}</h2>
        {INSTRUCTIONS.map((key) => (
          <BeachInstructionCard key={key} instructionKey={key} />
        ))}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
