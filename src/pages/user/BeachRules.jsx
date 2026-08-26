import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import BeachInstructionCard from '../../components/beach/BeachInstructionCard.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay.jsx';
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
    <div className="relative flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <TabMaintenanceOverlay tabId="beach-rules" fallbackTitle="Safety Guidelines Under Update" />
      <MobileHeader title={t('nav.beachRules')} showLanguage />
      <main className="relative flex-1 min-h-0 overflow-y-auto space-y-3 px-4 py-5">

        <BeachBanner
          badge="Safety & Guidelines"
          title={t('beach.rulesTitle', 'Beach Safety Guidelines')}
          subtitle="Please follow all drive-in beach rules for a safe and memorable experience."
        />
        {INSTRUCTIONS.map((key) => (
          <BeachInstructionCard key={key} instructionKey={key} />
        ))}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
