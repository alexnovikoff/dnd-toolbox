// StatusTag — "Готов" (accent) / "Скоро" (muted). Labels overridable.
export function StatusTag({ status, labels }) {
  const ready = status === 'ready';
  const text = ready ? labels?.ready ?? 'Готов' : labels?.soon ?? 'Скоро';
  return (
    <span
      style={{
        fontSize: 10.5,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 100,
        whiteSpace: 'nowrap',
        color: ready ? 'var(--ds-accent)' : 'var(--ds-faint)',
        border: `1px solid ${ready ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
        background: ready ? 'var(--ds-glow)' : 'transparent',
      }}
    >
      {text}
    </span>
  );
}
