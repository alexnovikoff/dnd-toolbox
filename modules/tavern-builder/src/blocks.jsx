// blocks.jsx — presentational blocks for the Tavern Builder (layout A).
// Ported from the design handoff (design-reference/tavern-ui.jsx) with the
// palette prop replaced by design-system tokens; lock/lockOpen/reroll icons
// now live in the shared icon set (viewBox 24, stroke 1.7).
import { Icon, SANS, SERIF } from '@dnd/design-system';
import { tavernName } from './engine.js';

// Module tag (DESIGN_SYSTEM.md §4) — permanent, theme-independent.
const TAG = '#b07a3f';

const Lx = (e, lang) => (e ? e[lang] : '');

// ── section shell: header + lock / reroll chrome shared by all five blocks ──
const iconBtn = (on) => ({
  width: 26,
  height: 26,
  borderRadius: 7,
  border: `1px solid ${on ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
  background: on ? 'var(--ds-glow)' : 'transparent',
  color: on ? 'var(--ds-accent)' : 'var(--ds-faint)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
});

export function SectionShell({ title, locked, onLock, onReroll, children }) {
  return (
    <div
      style={{
        background: 'var(--ds-panel)',
        border: `1px solid ${locked ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
        borderRadius: 14,
        padding: '14px 16px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: locked ? 'var(--ds-accent)' : 'var(--ds-faint)',
            fontWeight: 700,
          }}
        >
          {title}
        </span>
        {locked && (
          <Icon name="lock" size={11} stroke={1.7} style={{ color: 'var(--ds-accent)' }} />
        )}
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            className="ddtb-iconbtn"
            title={locked ? 'Разблокировать' : 'Заблокировать блок'}
            onClick={onLock}
            style={iconBtn(locked)}
          >
            <Icon name={locked ? 'lock' : 'lockOpen'} size={13} stroke={1.7} />
          </button>
          <button
            className="ddtb-iconbtn"
            title="Перебросить блок"
            onClick={locked ? undefined : onReroll}
            style={{
              ...iconBtn(false),
              opacity: locked ? 0.35 : 1,
              cursor: locked ? 'default' : 'pointer',
            }}
          >
            <Icon name="reroll" size={13} stroke={1.7} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── identity ──
function IdentityBlock({ t, lang, onEnliven, aiBusy }) {
  const id = t.identity;
  const name = tavernName(t, lang);
  const showAi = id.aiDesc && id.aiLang === lang;
  return (
    <div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--ds-text)',
          letterSpacing: '.01em',
          lineHeight: 1.15,
        }}
      >
        {lang === 'ru' ? `«${name}»` : name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ds-faint)', fontStyle: 'italic', marginTop: 5 }}>
        {Lx(id.sign, lang)}
      </div>
      <p
        style={{
          fontSize: 13,
          color: 'var(--ds-muted)',
          lineHeight: 1.55,
          margin: '10px 0 0',
          textWrap: 'pretty',
        }}
      >
        {Lx(id.light, lang)} {Lx(id.smell, lang)} {Lx(id.detail, lang)} {Lx(id.crowd, lang)}
      </p>
      {showAi && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--ds-text)',
            lineHeight: 1.55,
            margin: '10px 0 0',
            fontStyle: 'italic',
            textWrap: 'pretty',
          }}
        >
          <span style={{ color: 'var(--ds-accent)', fontStyle: 'normal', fontWeight: 700 }}>
            ❝{' '}
          </span>
          {id.aiDesc}
        </p>
      )}
      <button
        className="ddtb-btn"
        onClick={aiBusy ? undefined : onEnliven}
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 13px',
          borderRadius: 8,
          border: '1px solid var(--ds-line)',
          background: 'transparent',
          color: 'var(--ds-accent)',
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 600,
          cursor: aiBusy ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          opacity: aiBusy ? 0.6 : 1,
        }}
      >
        <Icon name="wand" size={14} />
        {aiBusy
          ? lang === 'ru'
            ? 'Claude пишет…'
            : 'Claude is writing…'
          : showAi
            ? lang === 'ru'
              ? 'Переписать описание'
              : 'Rewrite description'
            : lang === 'ru'
              ? 'Оживить описание'
              : 'Bring it to life'}
      </button>
    </div>
  );
}

// ── menu ──
function MenuList({ lang, items, title }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--ds-text)',
          marginBottom: 7,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 7, fontSize: 12.5 }}>
            <span
              style={{
                color: 'var(--ds-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {Lx(it, lang)}
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: '1px dotted var(--ds-line2)',
                minWidth: 12,
                transform: 'translateY(-3px)',
              }}
            />
            <span style={{ color: 'var(--ds-accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {lang === 'ru' ? it.pr : it.pe}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function MenuBlock({ t, lang, column }) {
  return (
    <div
      style={{ display: 'flex', flexDirection: column ? 'column' : 'row', gap: column ? 14 : 22 }}
    >
      <MenuList lang={lang} items={t.menu.food} title={lang === 'ru' ? 'Кухня' : 'Kitchen'} />
      <MenuList lang={lang} items={t.menu.drinks} title={lang === 'ru' ? 'Погреб' : 'Cellar'} />
    </div>
  );
}

// ── people ──
function PeopleBlock({ t, lang }) {
  const o = t.people.owner;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: 'var(--ds-text)' }}>
          {Lx(o.name, lang)}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: TAG,
            background: TAG + '1a',
            border: `1px solid ${TAG}40`,
            borderRadius: 100,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
          }}
        >
          {Lx(o.race, lang)}
        </span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ds-muted)', lineHeight: 1.5, marginTop: 6 }}>
        {Lx(o.trait, lang)} {Lx(o.quirk, lang)}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ds-faint)', lineHeight: 1.5, marginTop: 6 }}>
        <span
          style={{
            color: 'var(--ds-accent)',
            fontWeight: 700,
            letterSpacing: '.08em',
            fontSize: 10.5,
            textTransform: 'uppercase',
          }}
        >
          {lang === 'ru' ? 'Секрет ДМ · ' : 'DM secret · '}
        </span>
        {Lx(o.secret, lang)}
      </div>
      <div
        style={{
          marginTop: 11,
          paddingTop: 10,
          borderTop: '1px solid var(--ds-line2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {t.people.staff.map((s, i) => (
          <div key={i} style={{ fontSize: 12.5, color: 'var(--ds-muted)' }}>
            <span style={{ color: 'var(--ds-text)', fontWeight: 600 }}>{Lx(s.name, lang)}</span>
            <span style={{ color: 'var(--ds-faint)' }}> · {Lx(s.role, lang)} — </span>
            {Lx(s.detail, lang)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── patrons ──
function PatronsBlock({ t, lang }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {t.patrons.map((pt, i) => (
        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45 }}>
          <span style={{ color: 'var(--ds-text)', fontWeight: 600 }}>{Lx(pt.who, lang)}</span>
          <span style={{ color: 'var(--ds-muted)' }}> — {Lx(pt.doing, lang)}.</span>
        </div>
      ))}
    </div>
  );
}

// ── rumors ──
// Truth chips are functional graphics (like token frames) — local hexes allowed.
const TRUTH = {
  true: { ru: 'Правда', en: 'True', c: '#4fb487' },
  half: { ru: 'Отчасти', en: 'Partly', c: '#c9a84c' },
  false: { ru: 'Ложь', en: 'False', c: '#d06a52' },
};
function RumorsBlock({ t, lang }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {t.rumors.map((r, i) => {
        const tr = TRUTH[r.truth];
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: tr.c,
                background: tr.c + '1a',
                border: `1px solid ${tr.c}40`,
                borderRadius: 100,
                padding: '2px 7px',
                whiteSpace: 'nowrap',
                flex: '0 0 auto',
              }}
            >
              {tr[lang]}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--ds-muted)', lineHeight: 1.45 }}>
              {Lx(r, lang)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── section registry ──
export const TAVERN_SECTIONS = [
  { key: 'identity', title: 'Заведение' },
  { key: 'menu', title: 'Меню' },
  { key: 'people', title: 'Хозяин и персонал' },
  { key: 'patrons', title: 'Завсегдатаи' },
  { key: 'rumors', title: 'Слухи и зацепки' },
];

function blockBody(key, st, opts = {}) {
  const { tavern: t, lang } = st;
  switch (key) {
    case 'identity':
      return <IdentityBlock t={t} lang={lang} onEnliven={st.enliven} aiBusy={st.aiBusy} />;
    case 'menu':
      return <MenuBlock t={t} lang={lang} column={opts.menuColumn} />;
    case 'people':
      return <PeopleBlock t={t} lang={lang} />;
    case 'patrons':
      return <PatronsBlock t={t} lang={lang} />;
    case 'rumors':
      return <RumorsBlock t={t} lang={lang} />;
    default:
      return null;
  }
}

export function TavernSection({ k, st, opts }) {
  const s = TAVERN_SECTIONS.find((x) => x.key === k);
  return (
    <SectionShell
      title={s.title}
      locked={!!st.locks[k]}
      onLock={() => st.toggleLock(k)}
      onReroll={() => st.reroll(k)}
    >
      {blockBody(k, st, opts)}
    </SectionShell>
  );
}
