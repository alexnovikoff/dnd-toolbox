// card.jsx — the find on the card: what it is worth at a glance, then what is
// in it, then the story around it. Per-line lock and reroll, and the optional
// AI step. Laid out the way a GM reads during play: the sums the party asks
// about first, the things only the GM needs after them.
import { useEffect, useRef, useState } from 'react';
import { Button, Field, Icon, SANS, SERIF, fieldBoxStyle } from '@dnd/design-system';
import {
  STORY_KEYS,
  aiAvailable,
  fieldLabel,
  fieldText,
  gpText,
  haulMeta,
  haulTitle,
  haulValue,
  itemLockKey,
  itemMark,
  itemMeta,
  itemName,
  itemNote,
  markKey,
  shareOf,
  toText,
  valueSections,
  weightLabel,
} from './engine.js';
import { hasUserKey } from './api.js';
import { COPY } from './copy.js';

const COPIED_MS = 1500;
const HINT_MAX = 200;
const small = { fontSize: 12, padding: '8px 13px', whiteSpace: 'nowrap' };

const CARD = {
  background: 'var(--ds-panel)',
  border: '1px solid var(--ds-line2)',
  borderRadius: 14,
  padding: '20px 22px 22px',
};

const SECTION_TITLE = {
  fontSize: 10.5,
  letterSpacing: '.22em',
  textTransform: 'uppercase',
  color: 'var(--ds-faint)',
  fontWeight: 700,
  marginBottom: 8,
};

const TEXT = {
  fontSize: 13.5,
  lineHeight: 1.5,
  color: 'var(--ds-text)',
  textWrap: 'pretty',
};

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // clipboard API unavailable (insecure context, denied permission)
    try {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

function IconAction({ icon, label, on, disabled, onClick }) {
  return (
    <button
      className="ddtb-iconbtn"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        borderRadius: 7,
        border: `1px solid ${on ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
        background: on ? 'var(--ds-glow)' : 'transparent',
        color: on ? 'var(--ds-accent)' : 'var(--ds-faint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        padding: 0,
      }}
    >
      <Icon name={icon} size={12} stroke={1.7} />
    </button>
  );
}

function LineActions({ lockKey, label, st, onReroll }) {
  const t = COPY[st.lang];
  const locked = !!st.locks[lockKey];
  return (
    <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
      <IconAction
        icon={locked ? 'lock' : 'lockOpen'}
        label={`${locked ? t.unlock : t.lock}: ${label}`}
        on={locked}
        onClick={() => st.toggleLock(lockKey)}
      />
      <IconAction
        icon="reroll"
        label={`${t.reroll}: ${label}`}
        disabled={locked}
        onClick={onReroll}
      />
    </div>
  );
}

function RowLabel({ text, byAi, lang }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11.5,
        fontWeight: 600,
        color: 'var(--ds-muted)',
        paddingTop: 2,
      }}
    >
      <span>{text}</span>
      {byAi && (
        <span title={COPY[lang].aiWritten} style={{ color: 'var(--ds-accent)' }}>
          <Icon name="wand" size={11} />
        </span>
      )}
    </div>
  );
}

const ROW = {
  display: 'grid',
  gridTemplateColumns: '112px minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'start',
  padding: '8px 0',
  borderTop: '1px solid var(--ds-line2)',
};

function SectionRow({ k, st }) {
  const { haul, lang } = st;
  const label = fieldLabel(haul, k, lang);
  const text = fieldText(haul, k, lang);
  return (
    <div style={ROW}>
      <RowLabel text={label} byAi={haul.ai?.[k]?.lang === lang} lang={lang} />
      {Array.isArray(text) ? (
        <ul style={{ ...TEXT, margin: 0, paddingLeft: 16 }}>
          {text.map((line) => (
            <li key={line} style={{ marginBottom: 3 }}>
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <div style={TEXT}>{text}</div>
      )}
      <LineActions lockKey={k} label={label} st={st} onReroll={() => st.reroll(k)} />
    </div>
  );
}

function ItemRow({ line, st }) {
  const { haul, lang } = st;
  const name = itemName(line, lang);
  const byAi = haul.ai?.[markKey(line.uid)]?.lang === lang;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'start',
        padding: '10px 0',
        borderTop: '1px solid var(--ds-line2)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 15.5,
            fontWeight: 700,
            lineHeight: 1.25,
            color: 'var(--ds-text)',
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ds-accent)', marginTop: 3 }}>
          {itemMeta(line, lang)}
        </div>
        <div style={{ ...TEXT, fontSize: 13, marginTop: 5 }}>{itemNote(line, lang)}</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 5,
            fontSize: 12.5,
            lineHeight: 1.5,
            fontStyle: 'italic',
            color: 'var(--ds-muted)',
            marginTop: 3,
          }}
        >
          {byAi && (
            <span title={COPY[lang].aiWritten} style={{ color: 'var(--ds-accent)' }}>
              <Icon name="wand" size={11} />
            </span>
          )}
          <span>{itemMark(haul, line, lang)}</span>
        </div>
      </div>
      <LineActions
        lockKey={itemLockKey(line.uid)}
        label={name}
        st={st}
        onReroll={() => st.rerollItem(line.uid)}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--ds-faint)',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.2,
          marginTop: 3,
          color: 'var(--ds-accent)',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Stats({ st }) {
  const { haul, lang, params } = st;
  const t = COPY[lang];
  const party = params.party;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 22px',
        marginTop: 14,
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--ds-line2)',
        background: 'var(--ds-raised)',
      }}
    >
      <Stat label={t.statTotal} value={`≈ ${gpText(haulValue(haul), lang)}`} />
      <Stat label={t.statShare(party)} value={`≈ ${gpText(shareOf(haul, party), lang)}`} />
      <Stat label={t.statWeight} value={`≈ ${weightLabel(haul, lang)}`} />
      {haul.kind !== 'pockets' && <Stat label={t.statItems} value={haul.items.length} />}
    </div>
  );
}

// The question that guards every AI call. The button that opens it stays where
// it is and this appears below, so a double click can't land on «Да».
function AiQuestion({ st, onClose, onConfirm }) {
  const t = COPY[st.lang];
  const [hint, setHint] = useState('');
  const cost = hasUserKey()
    ? t.aiCostKey
    : st.remaining != null
      ? t.aiCostLeft(st.remaining)
      : t.aiCostFree;
  return (
    <div
      role="group"
      aria-label={t.aiQuestion}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      style={{
        marginTop: 12,
        padding: '14px 16px',
        borderRadius: 12,
        border: '1px solid var(--ds-line)',
        background: 'var(--ds-glow)',
        animation: 'ddtb-fadeIn .16s ease',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ds-text)' }}>{t.aiQuestion}</div>
      <p
        style={{ margin: '5px 0 11px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--ds-muted)' }}
      >
        {t.aiExplain} {cost}
      </p>
      <Field
        label={t.aiHint}
        hint={`(${t.aiHintNote})`}
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        placeholder={t.aiHintPlaceholder}
        inputProps={{ 'aria-label': t.aiHint, autoFocus: true, maxLength: HINT_MAX }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button onClick={() => onConfirm(hint.trim())}>{t.yes}</Button>
        <Button variant="secondary" onClick={onClose}>
          {t.no}
        </Button>
      </div>
    </div>
  );
}

function Actions({ st, asking, onAsk, aiButtonRef }) {
  const { haul, lang, isSaved, aiBusy, params } = st;
  const t = COPY[lang];
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    if (await copyText(toText(haul, lang, params.party))) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    }
  }

  const aiLabel = aiBusy
    ? t.aiBusy
    : Object.values(haul.ai || {}).some((a) => a.lang === lang)
      ? t.aiAgain
      : t.ai;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <Button
        variant="secondary"
        disabled={isSaved}
        onClick={st.save}
        icon={<Icon name={isSaved ? 'check' : 'plus'} size={13} />}
        style={{ ...small, ...(isSaved ? { color: 'var(--ds-muted)', cursor: 'default' } : null) }}
      >
        {isSaved ? t.saved : t.save}
      </Button>
      <Button variant="secondary" onClick={copy} style={small}>
        {copied ? t.copied : t.copy}
      </Button>
      <span style={{ flex: 1 }} />
      {haul.ai && (
        <Button variant="ghost" onClick={st.revertAi} style={small}>
          {t.aiRevert}
        </Button>
      )}
      {aiAvailable(haul) && (
        <button
          ref={aiButtonRef}
          className="ddtb-btn"
          aria-expanded={asking}
          disabled={aiBusy}
          onClick={onAsk}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 13px',
            borderRadius: 9,
            border: '1px solid var(--ds-line)',
            background: asking ? 'var(--ds-glow)' : 'transparent',
            color: 'var(--ds-accent)',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            cursor: aiBusy ? 'wait' : 'pointer',
            animation: aiBusy ? 'ddtb-pulse 1.4s ease-in-out infinite' : 'none',
          }}
        >
          <Icon name="wand" size={14} />
          {aiLabel}
        </button>
      )}
    </div>
  );
}

export function HaulCard({ st }) {
  const { haul, lang } = st;
  const t = COPY[lang];
  const [asking, setAsking] = useState(false);
  const aiButtonRef = useRef(null);

  const read = fieldText(haul, 'read', lang);
  const aiElsewhere = Object.values(haul.ai || {}).some((a) => a.lang !== lang);
  const error = st.aiError?.id === haul.id ? st.aiError.text : null;
  const values = valueSections(haul);
  const story = STORY_KEYS[haul.kind];

  function closeQuestion() {
    setAsking(false);
    aiButtonRef.current?.focus();
  }

  return (
    <div style={CARD}>
      <h2
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '.01em',
          color: 'var(--ds-text)',
        }}
      >
        {haulTitle(haul, lang)}
      </h2>
      <div style={{ fontSize: 13.5, color: 'var(--ds-muted)', marginTop: 6 }}>
        {haulMeta(haul, lang)}
      </div>
      {read && (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 14,
            lineHeight: 1.5,
            fontStyle: 'italic',
            color: 'var(--ds-text)',
          }}
        >
          {read}
        </p>
      )}

      <Stats st={st} />
      <Actions
        st={st}
        asking={asking}
        onAsk={() => setAsking((open) => !open)}
        aiButtonRef={aiButtonRef}
      />
      {asking && (
        <AiQuestion
          st={st}
          onClose={closeQuestion}
          onConfirm={(hint) => {
            closeQuestion();
            st.enliven(hint);
          }}
        />
      )}
      {error && (
        <div role="alert" style={{ marginTop: 10, fontSize: 12.5, color: 'var(--ds-danger)' }}>
          {error}
        </div>
      )}
      {aiElsewhere && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ds-faint)' }}>{t.aiOtherLang}</div>
      )}

      {values.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <div style={SECTION_TITLE}>{t.sectionValue}</div>
          {values.map((key) => (
            <SectionRow key={key} k={key} st={st} />
          ))}
        </section>
      )}

      {haul.items.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <div style={SECTION_TITLE}>{t.sectionItems}</div>
          {haul.items.map((line) => (
            <ItemRow key={line.uid} line={line} st={st} />
          ))}
        </section>
      )}

      {story.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <div style={SECTION_TITLE}>
            {haul.kind === 'reward' ? t.sectionPayment : t.sectionStory}
          </div>
          {story.map((key) => (
            <SectionRow key={key} k={key} st={st} />
          ))}
        </section>
      )}

      {st.isSaved && (
        <section style={{ marginTop: 18 }}>
          <div style={SECTION_TITLE}>{t.notes}</div>
          <textarea
            aria-label={t.notes}
            value={haul.notes || ''}
            onChange={(e) => st.setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            rows={3}
            style={{
              ...fieldBoxStyle,
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              resize: 'vertical',
              outline: 'none',
              color: 'var(--ds-text)',
              fontFamily: SANS,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          />
        </section>
      )}
    </div>
  );
}
