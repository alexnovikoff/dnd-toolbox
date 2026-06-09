import { Icon } from '../icons.jsx';
import { SANS } from '../constants.js';
import { LABEL_STYLE, fieldBoxStyle } from './Field.jsx';

// Select — labeled native <select> styled to match Field.
// `options`: array of strings or { value, label } objects.
export function Select({ label, value, onChange, options = [], style = {} }) {
  return (
    <div style={style}>
      {label && <label style={LABEL_STYLE}>{label}</label>}
      <div style={{ ...fieldBoxStyle, position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          style={{
            flex: 1,
            minWidth: 0,
            appearance: 'none',
            WebkitAppearance: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--ds-text)',
            fontSize: 13,
            fontFamily: SANS,
            cursor: 'pointer',
          }}
        >
          {options.map((o) =>
            typeof o === 'string' ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            )
          )}
        </select>
        <Icon
          name="chevron"
          size={14}
          style={{ color: 'var(--ds-muted)', transform: 'rotate(90deg)', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
