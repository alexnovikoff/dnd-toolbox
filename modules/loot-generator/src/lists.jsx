// lists.jsx — the empty state and the saved finds. Compact rows; opening one
// puts the full find back on the card.
import { useState } from 'react';
import { Button, Icon, SERIF } from '@dnd/design-system';
import { gpText, haulMeta, haulTitle, haulValue } from './engine.js';
import { COPY } from './copy.js';

const LIST = {
  background: 'var(--ds-panel)',
  border: '1px solid var(--ds-line2)',
  borderRadius: 14,
  padding: '4px 22px',
};

const rowStyle = (first) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 14,
  alignItems: 'start',
  padding: '14px 0',
  borderTop: first ? 'none' : '1px solid var(--ds-line2)',
});

const SMALL_BUTTON = { fontSize: 12, padding: '7px 12px', whiteSpace: 'nowrap' };

export function EmptyCard({ title, text }) {
  return (
    <div
      style={{
        background: 'var(--ds-panel)',
        border: '1px solid var(--ds-line2)',
        borderRadius: 14,
        padding: '56px 32px',
        textAlign: 'center',
      }}
    >
      <Icon name="loot" size={32} style={{ color: 'var(--ds-faint)', margin: '0 auto 14px' }} />
      {title && (
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: 'var(--ds-text)' }}>
          {title}
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--ds-muted)', marginTop: 6, lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}

export function SavedList({ st }) {
  const { library, lang } = st;
  const t = COPY[lang];
  const [removing, setRemoving] = useState(null);
  if (!library.length) return <EmptyCard text={t.savedEmpty} />;
  return (
    <div style={LIST}>
      {library.map((haul, i) => {
        const title = haulTitle(haul, lang);
        return (
          <div key={haul.id} style={rowStyle(i === 0)}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: 'var(--ds-text)',
                  lineHeight: 1.25,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ds-faint)', marginTop: 3 }}>
                {haulMeta(haul, lang)} · ≈ {gpText(haulValue(haul), lang)}
              </div>
              {haul.notes && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ds-muted)',
                    marginTop: 6,
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {haul.notes}
                </div>
              )}
            </div>
            {removing === haul.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ds-muted)' }}>{t.removeAsk}</span>
                <Button
                  style={SMALL_BUTTON}
                  onClick={() => {
                    st.remove(haul.id);
                    setRemoving(null);
                  }}
                >
                  {t.yes}
                </Button>
                <Button variant="secondary" style={SMALL_BUTTON} onClick={() => setRemoving(null)}>
                  {t.no}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button variant="secondary" style={SMALL_BUTTON} onClick={() => st.open(haul)}>
                  {t.open}
                </Button>
                <button
                  className="ddtb-iconbtn"
                  aria-label={`${t.remove}: ${title}`}
                  title={t.remove}
                  onClick={() => setRemoving(haul.id)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: '1px solid var(--ds-line2)',
                    background: 'transparent',
                    color: 'var(--ds-faint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
