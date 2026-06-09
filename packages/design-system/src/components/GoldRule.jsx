// GoldRule — decorative accent divider (line · diamond · line).
export function GoldRule({ w = 44 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: w,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--ds-accent))',
        }}
      />
      <span
        style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: 'var(--ds-accent)' }}
      />
      <span
        style={{
          width: w,
          height: 1,
          background: 'linear-gradient(90deg, var(--ds-accent), transparent)',
        }}
      />
    </div>
  );
}
