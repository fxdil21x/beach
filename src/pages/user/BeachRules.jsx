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
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('nav.beachRules')} showLanguage />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-3 px-4 py-6">
        <h2 className="text-xl font-bold">{t('beach.rulesTitle')}</h2>
        {INSTRUCTIONS.map((key) => (
          <BeachInstructionCard key={key} instructionKey={key} />
        ))}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
