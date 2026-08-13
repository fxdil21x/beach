import { useTranslation } from 'react-i18next';

export default function BeachInstructionCard({ instructionKey }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900">
      <p>{t(instructionKey)}</p>
    </div>
  );
}
