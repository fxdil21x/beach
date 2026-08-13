export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-medium text-gray-800">{title}</p>
      {description && <p className="mt-2 text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
