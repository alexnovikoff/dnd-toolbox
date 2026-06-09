import { SANS } from '../constants.js';

// ToggleGroup — segmented single-choice control (e.g. gender / length).
// `options`: array of values; `labels`: optional { value: label } map.
export function ToggleGroup({ options = [], value, onChange, labels }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            className="ddtb-btn"
            onClick={() => onChange(o)}
            style={{
              flex: 1,
              padding: '9px 8px',
              borderRadius: 8,
              border: `1px solid ${on ? 'var(--ds-accent)' : 'var(--ds-line2)'}`,
              background: on ? 'var(--ds-glow)' : 'transparent',
              color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: on ? 700 : 500,
              fontFamily: SANS,
            }}
          >
            {labels?.[o] ?? o}
          </button>
        );
      })}
    </div>
  );
}
