import { useState } from 'react';
import { Icon } from '../icons.jsx';
import { useTheme } from '../theme.jsx';
import { ACCENTS } from '../palette.js';
import { SANS } from '../constants.js';

// AppearanceControls — theme toggle (☾/☀) + accent popover. Reads/writes theme
// state through useTheme(); no props required.
export function AppearanceControls() {
  const { theme, accent, toggleTheme, setAccent } = useTheme();
  const [open, setOpen] = useState(false);

  const cur = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
  const curHex = theme === 'light' ? cur.light : cur.dark;

  const btn = {
    width: 36,
    height: 36,
    borderRadius: 9,
    border: '1px solid var(--ds-line2)',
    background: 'var(--ds-panel)',
    color: 'var(--ds-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <button
        className="ddtb-iconbtn"
        title="Сменить тему"
        aria-label="Сменить тему"
        onClick={toggleTheme}
        style={btn}
      >
        <Icon name={theme === 'light' ? 'sun' : 'moon'} size={17} />
      </button>
      <button
        className="ddtb-iconbtn"
        title="Цветовой акцент"
        aria-label="Цветовой акцент"
        onClick={() => setOpen((o) => !o)}
        style={{ ...btn, width: 'auto', gap: 7, padding: '0 11px' }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 14,
            background: curHex,
            boxShadow: '0 0 0 2px var(--ds-glow)',
          }}
        />
        <Icon name="chevron" size={13} style={{ transform: 'rotate(90deg)', color: 'var(--ds-faint)' }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute',
              top: 44,
              right: 0,
              zIndex: 41,
              width: 230,
              background: 'var(--ds-panel)',
              border: '1px solid var(--ds-line)',
              borderRadius: 14,
              padding: 14,
              boxShadow: '0 18px 50px rgba(0,0,0,.4)',
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ds-faint)',
                fontWeight: 700,
                marginBottom: 9,
              }}
            >
              Тема
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: 3,
                borderRadius: 10,
                background: 'var(--ds-raised)',
                border: '1px solid var(--ds-line2)',
                marginBottom: 15,
              }}
            >
              {[
                ['dark', 'moon', 'Тёмная'],
                ['light', 'sun', 'Светлая'],
              ].map(([id, ic, lbl]) => {
                const on = theme === id;
                return (
                  <button
                    key={id}
                    className="ddtb-btn"
                    onClick={() => {
                      if (!on) toggleTheme();
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: SANS,
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: on ? 'var(--ds-glow)' : 'transparent',
                      color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
                    }}
                  >
                    <Icon name={ic} size={15} /> {lbl}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ds-faint)',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Акцент
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {ACCENTS.map((a) => {
                const hex = theme === 'light' ? a.light : a.dark;
                const on = a.id === accent;
                return (
                  <button
                    key={a.id}
                    className="ddtb-sw"
                    title={a.name}
                    aria-label={a.name}
                    onClick={() => setAccent(a.id)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 8,
                      background: hex,
                      cursor: 'pointer',
                      border: on ? '2px solid var(--ds-text)' : '1px solid var(--ds-line2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    {on && <Icon name="check" size={13} style={{ color: 'var(--ds-on-accent)' }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 9, fontSize: 11.5, color: 'var(--ds-muted)' }}>{cur.name}</div>
          </div>
        </>
      )}
    </div>
  );
}
