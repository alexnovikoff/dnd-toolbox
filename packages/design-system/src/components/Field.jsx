import { Icon } from '../icons.jsx';
import { SANS } from '../constants.js';

const LABEL_STYLE = {
  fontSize: 10.5,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--ds-faint)',
  fontWeight: 700,
  marginBottom: 7,
  display: 'block',
};

// Shared wrapper style for inputs/selects (DESIGN_SYSTEM.md §8 forms).
export const fieldBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '10px 12px',
  borderRadius: 9,
  border: '1px solid var(--ds-line2)',
  background: 'var(--ds-raised)',
};

// Field — labeled text input. Optional leading `icon` and trailing `right`
// adornment (e.g. a dice/randomize button) rendered inside the field border.
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  right,
  hint,
  style = {},
  inputProps = {},
}) {
  return (
    <div style={style}>
      {label && (
        <label style={LABEL_STYLE}>
          {label}
          {hint && (
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ds-muted)' }}>
              {' '}
              {hint}
            </span>
          )}
        </label>
      )}
      <div style={fieldBoxStyle}>
        {icon && <Icon name={icon} size={15} style={{ color: 'var(--ds-muted)' }} />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--ds-text)',
            fontSize: 13,
            fontFamily: SANS,
          }}
          {...inputProps}
        />
        {right}
      </div>
    </div>
  );
}

export { LABEL_STYLE };
