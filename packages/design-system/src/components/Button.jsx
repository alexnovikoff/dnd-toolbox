import { SANS } from '../constants.js';

// Button — primary (accent fill, on-accent text) / secondary (outline) / ghost.
// DESIGN_SYSTEM.md §8. Pass `icon` for a leading <Icon/> element.
export function Button({
  variant = 'primary',
  icon = null,
  children,
  style = {},
  className = '',
  ...rest
}) {
  const base = {
    fontFamily: SANS,
    fontWeight: variant === 'primary' ? 700 : 600,
    fontSize: 13,
    lineHeight: 1,
    borderRadius: 9,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 18px',
  };
  const variants = {
    primary: {
      background: 'var(--ds-accent)',
      color: 'var(--ds-on-accent)',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--ds-text)',
      border: '1px solid var(--ds-line2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ds-muted)',
      border: '1px solid var(--ds-line2)',
    },
  };
  return (
    <button
      className={('ddtb-btn ' + className).trim()}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
