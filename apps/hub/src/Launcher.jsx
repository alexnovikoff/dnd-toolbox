// Launcher.jsx — the hub home screen (recreates design-reference HubGrid).
import { useNavigate } from 'react-router-dom';
import { BrandMark, Icon, GoldRule, ToolCard, AppearanceControls, SERIF } from '@dnd/design-system';
import { manifests } from './registry.js';
import { COMING_SOON } from './comingSoon.js';
import { groupLabel } from './groups.js';

function TopBar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 28px',
        height: 60,
        borderBottom: '1px solid var(--ds-line2)',
        flex: '0 0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BrandMark size={26} />
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '.14em',
            color: 'var(--ds-text)',
          }}
        >
          D&amp;D TOOLBOX
        </span>
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 13px',
          borderRadius: 9,
          border: '1px solid var(--ds-line2)',
          background: 'var(--ds-panel)',
          color: 'var(--ds-faint)',
          width: 230,
        }}
      >
        <Icon name="search" size={16} />
        <span
          style={{
            fontSize: 12.5,
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Поиск инструмента…
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            border: '1px solid var(--ds-line2)',
            color: 'var(--ds-faint)',
          }}
        >
          ⌘K
        </span>
      </div>
      <AppearanceControls />
    </div>
  );
}

function SectionLabel({ icon, iconColor, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 13,
        color: 'var(--ds-muted)',
        fontSize: 11.5,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name={icon} size={14} style={{ color: iconColor }} /> {children}
    </div>
  );
}

export default function Launcher() {
  const navigate = useNavigate();
  const featured = manifests.filter((m) => m.status === 'ready');
  const soon = COMING_SOON;

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'var(--ds-bg)',
        color: 'var(--ds-text)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TopBar />
      <div style={{ flex: 1, padding: '34px 48px', position: 'relative', overflow: 'auto' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 360,
            background: 'radial-gradient(80% 100% at 50% -10%, var(--ds-glow), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 30 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.34em',
              textTransform: 'uppercase',
              color: 'var(--ds-accent)',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Инструментарий Мастера
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 40,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '.02em',
              color: 'var(--ds-text)',
            }}
          >
            D&amp;D Toolbox
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--ds-muted)',
              margin: '12px auto 16px',
              maxWidth: 440,
              lineHeight: 1.5,
            }}
          >
            Все инструменты для подготовки и ведения игр в одном месте.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoldRule />
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 1040, margin: '0 auto' }}>
          <SectionLabel icon="bolt" iconColor="var(--ds-accent)">
            Готовы к работе
          </SectionLabel>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 26 }}
          >
            {featured.map((m) => (
              <div
                key={m.id}
                className="ddtb-tile ddtb-clk"
                style={{ '--acc': 'var(--ds-line)' }}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/tool/' + m.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/tool/' + m.id);
                  }
                }}
              >
                <ToolCard tool={m} variant="feature" groupLabel={groupLabel(m.group)} />
              </div>
            ))}
          </div>

          <SectionLabel icon="plus" iconColor="var(--ds-faint)">
            Скоро в наборе
          </SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {soon.map((m) => (
              <ToolCard key={m.id} tool={m} variant="tile" groupLabel={groupLabel(m.group)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
