/** OpenSea-style blue verified badge */
const Verified = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-label="Verified" role="img" style={{ flexShrink: 0 }}>
    <path
      fill="var(--accent)"
      d="M12 1.5l2.5 1.9 3.1-.2 1 3 2.7 1.6-.8 3 1.5 2.7-2.3 2.1-.2 3.1-3 .7-1.7 2.6-2.9-1.1L9 22l-1.8-2.6-3.1-.6-.3-3.1L1.5 13.6 3 10.9l-.8-3L4.9 6.3 6 3.3l3.1.2z"
    />
    <path d="M7.5 12.2l3 3 6-6.2" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default Verified
