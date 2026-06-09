import { Icon } from '../icons.jsx';
import { Sidebar } from './Sidebar.jsx';
import { AppearanceControls } from './AppearanceControls.jsx';

// AppShell — module frame: grouped sidebar + breadcrumb top bar + work area.
// `active` is the current module manifest; `groups` feeds the sidebar; children
// is the module's own UI.
export function AppShell({ active, groups = [], groupLabel, onBack, onHome, onNavigate, children }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'var(--ds-bg)',
        color: 'var(--ds-text)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <Sidebar groups={groups} activeId={active?.id} onNavigate={onNavigate} onHome={onHome} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 26px',
            height: 56,
            borderBottom: '1px solid var(--ds-line2)',
            flex: '0 0 auto',
          }}
        >
          {onBack && (
            <button
              className="ddtb-iconbtn"
              onClick={onBack}
              title="На главную"
              aria-label="На главную"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--ds-line2)',
                background: 'var(--ds-panel)',
                color: 'var(--ds-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                marginRight: 2,
              }}
            >
              <Icon name="back" size={17} />
            </button>
          )}
          <span
            onClick={onHome}
            className={onHome ? 'ddtb-clk' : ''}
            style={{ fontSize: 12.5, color: 'var(--ds-faint)' }}
          >
            {groupLabel}
          </span>
          <Icon name="chevron" size={14} style={{ color: 'var(--ds-faint)' }} />
          {active && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: active.accent }}>
              <Icon name={active.icon} size={17} />
            </span>
          )}
          <span
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--ds-text)', whiteSpace: 'nowrap' }}
          >
            {active?.name}
          </span>
          <div style={{ flex: 1 }} />
          <AppearanceControls />
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}
