// quick.jsx — single rolls for the moment a GM needs one gem or one potion and
// not a whole hoard. Each row has its own filter; the danger band comes from
// the params column. Results pile up below, newest first.
import { useEffect, useRef, useState } from 'react';
import { Button, Icon, SERIF, Select } from '@dnd/design-system';
import {
  QUICK_VALUES,
  gpText,
  quickReady,
  quickText,
  quickToText,
  spellLevelLabel,
} from './engine.js';
import { LOOT_DATA as D } from './data.js';
import { COPY } from './copy.js';
import { copyText } from './card.jsx';

const COPIED_MS = 1500;

const PANEL = {
  background: 'var(--ds-panel)',
  border: '1px solid var(--ds-line2)',
  borderRadius: 14,
  padding: '18px 22px 20px',
};

const small = { fontSize: 12, padding: '7px 12px', whiteSpace: 'nowrap' };

function rarityOptions(t, lang) {
  return [
    { value: 'any', label: t.anyRarity },
    ...D.rarities.map((r) => ({ value: r.id, label: r[lang] })),
  ];
}

function valueOptions(values, t, lang) {
  return [
    { value: 'any', label: t.any },
    ...values.map((v) => ({ value: String(v), label: gpText(v, lang) })),
  ];
}

function levelOptions(t, lang) {
  return [
    { value: 'any', label: t.anyLevel },
    ...D.spells.map((_, level) => ({ value: String(level), label: spellLevelLabel(level, lang) })),
  ];
}

function catOptions(t, lang) {
  return [
    { value: 'any', label: t.anyCat },
    ...D.categories.map((c) => ({ value: c.id, label: c[lang] })),
  ];
}

function QuickRow({ type, st, selects = [] }) {
  const t = COPY[st.lang];
  const ready = quickReady(type, st.quickOpts);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '84px minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'center',
        padding: '9px 0',
        borderTop: '1px solid var(--ds-line2)',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-text)' }}>{t.quick[type]}</div>
      <div style={{ display: 'flex', gap: 8, minWidth: 0 }}>
        {selects.map(({ key, options }) => (
          <Select
            key={key}
            value={st.quickOpts[key]}
            onChange={(e) => st.setQuickOpt(key, e.target.value)}
            options={options}
            style={{ flex: 1, minWidth: 0 }}
          />
        ))}
      </div>
      <Button
        variant="secondary"
        disabled={!ready}
        title={ready ? undefined : t.quickNone}
        aria-label={`${t.quickRoll}: ${t.quick[type]}`}
        icon={<Icon name="dice" size={13} />}
        onClick={() => st.quickRoll(type)}
        style={small}
      >
        {t.quickRoll}
      </Button>
    </div>
  );
}

function PickRow({ pick, st, first }) {
  const t = COPY[st.lang];
  const { title, meta, note, mark } = quickText(pick, st.lang);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'start',
        padding: '10px 0',
        borderTop: first ? 'none' : '1px solid var(--ds-line2)',
        animation: first ? 'ddtb-fadeIn .16s ease' : 'none',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.3,
            color: 'var(--ds-text)',
          }}
        >
          {title}
        </div>
        {meta && (
          <div style={{ fontSize: 12, color: 'var(--ds-accent)', marginTop: 3 }}>{meta}</div>
        )}
        {note && (
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ds-text)', marginTop: 4 }}>
            {note}
          </div>
        )}
        {mark && (
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.5,
              fontStyle: 'italic',
              color: 'var(--ds-muted)',
              marginTop: 3,
            }}
          >
            {mark}
          </div>
        )}
      </div>
      <button
        className="ddtb-iconbtn"
        aria-label={`${t.quickRemove}: ${title}`}
        title={t.quickRemove}
        onClick={() => st.removePick(pick.id)}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
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
        <Icon name="close" size={11} />
      </button>
    </div>
  );
}

export function QuickPanel({ st }) {
  const { lang, picks } = st;
  const t = COPY[lang];
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyAll() {
    if (await copyText(picks.map((pick) => quickToText(pick, lang)).join('\n'))) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={PANEL}>
        <h2
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--ds-text)',
          }}
        >
          {t.quickTitle}
        </h2>
        <p style={{ margin: '4px 0 12px', fontSize: 13, color: 'var(--ds-muted)' }}>
          {t.quickHint}
        </p>
        <QuickRow type="coins" st={st} />
        <QuickRow
          type="gem"
          st={st}
          selects={[{ key: 'gem', options: valueOptions(QUICK_VALUES.gem, t, lang) }]}
        />
        <QuickRow
          type="art"
          st={st}
          selects={[{ key: 'art', options: valueOptions(QUICK_VALUES.art, t, lang) }]}
        />
        <QuickRow type="trinket" st={st} />
        <QuickRow
          type="potion"
          st={st}
          selects={[{ key: 'potion', options: rarityOptions(t, lang) }]}
        />
        <QuickRow
          type="scroll"
          st={st}
          selects={[{ key: 'scroll', options: levelOptions(t, lang) }]}
        />
        <QuickRow
          type="item"
          st={st}
          selects={[
            { key: 'itemRarity', options: rarityOptions(t, lang) },
            { key: 'itemCat', options: catOptions(t, lang) },
          ]}
        />
      </div>

      <div style={{ ...PANEL, padding: '6px 22px 12px' }}>
        {picks.length ? (
          <>
            {picks.map((pick, i) => (
              <PickRow key={pick.id} pick={pick} st={st} first={i === 0} />
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Button variant="secondary" onClick={copyAll} style={small}>
                {copied ? t.copied : t.quickCopyAll}
              </Button>
              <Button variant="ghost" onClick={st.clearPicks} style={small}>
                {t.quickClear}
              </Button>
            </div>
          </>
        ) : (
          <div style={{ padding: '14px 0', fontSize: 13, color: 'var(--ds-muted)' }}>
            {t.quickEmpty}
          </div>
        )}
      </div>
    </div>
  );
}
