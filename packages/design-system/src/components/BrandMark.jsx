// BrandMark — hexagonal hub logo. Color follows the active accent.
export function BrandMark({ size = 32, style = {} }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: '0 0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ds-accent)',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 2.2 20.4 7v10L12 21.8 3.6 17V7Z" />
        <path d="M12 2.2V21.8M3.6 7l16.8 10M20.4 7 3.6 17" opacity="0.5" />
        <circle cx="12" cy="12" r="3.1" fill="var(--ds-accent)" stroke="none" />
      </svg>
    </div>
  );
}
