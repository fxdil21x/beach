export default function BeachInfo() {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-blue-900">Muzhappilangad Drive-in Beach</h2>
      <p className="mb-4 text-gray-700">
        Kerala&apos;s only drive-in beach, stretching about 4 km along the Malabar coast.
        This app will help verify beach access and manage resident registrations.
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Location</dt>
          <dd className="text-gray-900">Kannur District, Kerala</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="text-green-600">Phase 1 — Scaffold</dd>
        </div>
      </dl>
    </section>
  );
}
