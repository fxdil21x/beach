export default function JsonFileIcon({ className = 'h-10 w-10' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 4C11.7909 4 10 5.79086 10 8V56C10 58.2091 11.7909 60 14 60H50C52.2091 60 54 58.2091 54 56V20L38 4H14Z"
        fill="#E8F1FF"
        stroke="#2563EB"
        strokeWidth="2"
      />
      <path d="M38 4V18C38 19.1046 38.8954 20 40 20H54" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      <rect x="16" y="28" width="32" height="22" rx="4" fill="#2563EB" />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        JSON
      </text>
      <path
        d="M22 52H42"
        stroke="#93C5FD"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 48H36"
        stroke="#93C5FD"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
