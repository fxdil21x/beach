export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto flex h-full w-full max-w-8xl flex-col px-3.5 py-4 sm:px-6 sm:py-6 ${className}`}>
      {children}
    </div>
  );
}
