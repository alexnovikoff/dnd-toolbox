import { Icon } from '../icons.jsx';

// IconChip — the module's colored icon badge. `accent` is the module's permanent
// color tag (a literal hex from its manifest, theme-independent by design —
// DESIGN_SYSTEM.md §4), so it is intentionally NOT a token.
export function IconChip({ icon, accent, size = 46 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 11,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        background: `${accent}1a`,
        border: `1px solid ${accent}40`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
      }}
    >
      <Icon name={icon} size={size * 0.5} stroke={1.6} />
    </div>
  );
}
