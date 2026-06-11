import { SANS } from '../constants.js';

// ToggleGroup — segmented single-choice control (e.g. gender / length).
// `options`: array of values; `labels`: optional { value: label } map.
// `variant`: 'buttons' (default — separate bordered buttons) or 'segment'
// (compact boxed segment-control, DESIGN_SYSTEM.md recipe used by Tavern Builder).
export function ToggleGroup({ options = [], value, onChange, labels, variant = 'buttons' }) {
  if (variant === 'segment') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 3,
          padding: 3,
          borderRadius: 9,
          background: 'var(--ds-raised)',
          border: '1px solid var(--ds-line2)',
        }}
      >
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              className="ddtb-btn"
              onClick={() => onChange(o)}
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '6px 6px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: on ? 'var(--ds-glow)' : 'transparent',
                color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
                boxShadow: on ? 'inset 0 0 0 1px var(--ds-line)' : 'none',
              }}
            >
              {labels?.[o] ?? o}
            </button>
          );
        })}
      </div>
    );
  }
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
