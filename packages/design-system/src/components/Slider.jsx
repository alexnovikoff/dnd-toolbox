// Slider — labeled range input with accent fill (uses .tc-range from
// components.css). Value shown next to the label with an optional suffix.
export function Slider({ label, value, min = 0, max = 100, step = 1, onChange, suffix = '' }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div>
      {label != null && (
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--ds-faint)',
            fontWeight: 700,
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{label}</span>
          <span style={{ color: 'var(--ds-accent)' }}>
            {value}
            {suffix}
          </span>
        </div>
      )}
      <input
        className="tc-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          '--acc': 'var(--ds-accent)',
          '--th': 'var(--ds-text)',
          background: `linear-gradient(90deg, var(--ds-accent) ${pct}%, var(--ds-line2) ${pct}%)`,
        }}
      />
    </div>
  );
}
