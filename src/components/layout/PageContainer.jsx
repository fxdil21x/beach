export default function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-6 md:px-6 ${className}`}>
      {children}
    </div>
  );
}
