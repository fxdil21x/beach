export default function ResidentPhoto({ src, alt, className = '' }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-gray-200 text-gray-500 ${className}`}>
        No Photo
      </div>
    );
  }

  return <img src={src} alt={alt} className={`rounded-2xl object-cover ${className}`} />;
}
