import LanguageSelector from '../language/LanguageSelector.jsx';

export default function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-xl font-semibold text-blue-900">Muzhappilangad Beach</h1>
        <LanguageSelector />
      </div>
    </header>
  );
}
