// lists.jsx — the empty state, the crowd and the saved NPCs. Compact rows;
// opening one puts the full NPC on the card.
import { useState } from 'react';
import { Button, Icon, SERIF } from '@dnd/design-system';
import { FIELD_LABELS, fieldText } from './engine.js';
import { NPC_DATA as D } from './data.js';
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

const NAME_STYLE = {
  fontFamily: SERIF,
  fontSize: 15.5,
  fontWeight: 700,
  color: 'var(--ds-text)',
  lineHeight: 1.25,
};
const META_STYLE = { fontSize: 12, color: 'var(--ds-faint)', marginTop: 3 };
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
      <Icon name="npc" size={32} style={{ color: 'var(--ds-faint)', margin: '0 auto 14px' }} />
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

function metaLine(npc, lang) {
  return `${fieldText(npc, 'who', lang)} · ${fieldText(npc, 'occupation', lang)}`;
}

export function CrowdList({ st }) {
  const { people, lang } = st;
  const t = COPY[lang];
  if (!people.length) return <EmptyCard text={t.crowdEmpty} />;
  return (
    <div style={LIST}>
      {people.map((npc, i) => (
        <div key={npc.id} style={rowStyle(i === 0)}>
          <div style={{ minWidth: 0 }}>
            <div style={NAME_STYLE}>{fieldText(npc, 'name', lang)}</div>
            <div style={META_STYLE}>{metaLine(npc, lang)}</div>
            <div style={{ fontSize: 13, color: 'var(--ds-text)', marginTop: 7, lineHeight: 1.5 }}>
              {fieldText(npc, 'feature', lang)}
            </div>
            <div
              style={{ fontSize: 12.5, color: 'var(--ds-muted)', marginTop: 3, lineHeight: 1.5 }}
            >
              {fieldText(npc, 'mood', lang)}
            </div>
            <div
              style={{ fontSize: 12.5, color: 'var(--ds-muted)', marginTop: 3, lineHeight: 1.5 }}
            >
              {FIELD_LABELS.want[lang]}: {fieldText(npc, 'want', lang)}
            </div>
          </div>
          <Button variant="secondary" style={SMALL_BUTTON} onClick={() => st.open(npc)}>
            {t.open}
          </Button>
        </div>
      ))}
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
      {library.map((npc, i) => {
        const name = fieldText(npc, 'name', lang);
        const level = D.levels.find((l) => l.id === npc.level)[lang];
        return (
          <div key={npc.id} style={rowStyle(i === 0)}>
            <div style={{ minWidth: 0 }}>
              <div style={NAME_STYLE}>{name}</div>
              <div style={META_STYLE}>
                {metaLine(npc, lang)} · {level}
              </div>
              {npc.notes && (
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
                  {npc.notes}
                </div>
              )}
            </div>
            {removing === npc.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ds-muted)' }}>{t.removeAsk}</span>
                <Button
                  style={SMALL_BUTTON}
                  onClick={() => {
                    st.remove(npc.id);
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
                <Button variant="secondary" style={SMALL_BUTTON} onClick={() => st.open(npc)}>
                  {t.open}
                </Button>
                <button
                  className="ddtb-iconbtn"
                  aria-label={`${t.remove}: ${name}`}
                  title={t.remove}
                  onClick={() => setRemoving(npc.id)}
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
