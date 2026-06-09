import { Icon } from '../icons.jsx';
import { SERIF } from '../constants.js';
import { BrandMark } from './BrandMark.jsx';

// Sidebar — grouped module navigation for the module shell.
// `groups`: [{ key, label, items: [manifest] }]. Ready items navigate; soon
// items are dimmed and inert.
export function Sidebar({ groups = [], activeId, onNavigate, onHome, collapsed = false }) {
  const w = collapsed ? 64 : 232;
  return (
    <aside
      style={{
        width: w,
        flex: `0 0 ${w}px`,
        background: 'var(--ds-panel)',
        borderRight: '1px solid var(--ds-line2)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        onClick={onHome}
        className={onHome ? 'ddtb-side ddtb-clk' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: collapsed ? '18px 0' : '18px 18px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--ds-line2)',
        }}
      >
        <BrandMark size={30} />
        {!collapsed && (
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--ds-text)',
              letterSpacing: '.08em',
            }}
          >
            TOOLBOX
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: collapsed ? '12px 8px' : '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'auto',
        }}
      >
        {groups.map((g) => (
          <div key={g.key ?? g.label}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ds-faint)',
                  fontWeight: 700,
                  padding: '0 10px 7px',
                }}
              >
                {g.label}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map((t) => {
                const on = t.id === activeId;
                const clickable = onNavigate && t.status === 'ready' && !on;
                return (
                  <div
                    key={t.id}
                    onClick={clickable ? () => onNavigate(t.id) : undefined}
                    className={clickable ? 'ddtb-side ddtb-clk' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: collapsed ? '9px 0' : '8px 10px',
                      borderRadius: 9,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: on ? 'var(--ds-glow)' : 'transparent',
                      border: `1px solid ${on ? 'var(--ds-line)' : 'transparent'}`,
                      color: on ? 'var(--ds-text)' : 'var(--ds-muted)',
                      opacity: t.status === 'soon' ? 0.6 : 1,
                    }}
                  >
                    <span style={{ color: on ? t.accent : 'var(--ds-muted)', display: 'flex' }}>
                      <Icon name={t.icon} size={18} />
                    </span>
                    {!collapsed && (
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: on ? 600 : 500,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.name}
                      </span>
                    )}
                    {!collapsed && on && (
                      <span
                        style={{ width: 5, height: 5, borderRadius: 5, background: 'var(--ds-accent)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: collapsed ? '12px 8px' : '12px',
          borderTop: '1px solid var(--ds-line2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: collapsed ? '9px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--ds-muted)',
          }}
        >
          <Icon name="gear" size={18} />
          {!collapsed && <span style={{ fontSize: 13.5, fontWeight: 500 }}>Настройки</span>}
        </div>
      </div>
    </aside>
  );
}
