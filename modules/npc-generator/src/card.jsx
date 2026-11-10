// card.jsx — the NPC card: identity, fields by importance, per-field lock and
// reroll, and the optional AI step. Laid out the way a GM reads during play:
// what the party sees first, what only the GM needs after it.
import { useEffect, useRef, useState } from 'react';
import { Button, Field, Icon, SANS, SERIF, fieldBoxStyle } from '@dnd/design-system';
import { FIELD_LABELS, LEVEL_FIELDS, SECTIONS, fieldText, toText } from './engine.js';
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

async function copyText(text) {
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

function FieldActions({ k, st }) {
  const t = COPY[st.lang];
  const label = FIELD_LABELS[k][st.lang];
  const locked = !!st.locks[k];
  return (
    <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
      <IconAction
        icon={locked ? 'lock' : 'lockOpen'}
        label={`${locked ? t.unlock : t.lock}: ${label}`}
        on={locked}
        onClick={() => st.toggleLock(k)}
      />
      <IconAction
        icon="reroll"
        label={`${t.reroll}: ${label}`}
        disabled={locked}
        onClick={() => st.reroll(k)}
      />
    </div>
  );
}

function FieldValue({ k, st }) {
  const { npc, lang } = st;
  const text = fieldText(npc, k, lang);
  const textStyle = {
    fontSize: 13.5,
    lineHeight: 1.5,
    color: 'var(--ds-text)',
    textWrap: 'pretty',
  };

  if (Array.isArray(text)) {
    return (
      <ul style={{ ...textStyle, margin: 0, paddingLeft: 16 }}>
        {text.map((line) => (
          <li key={line} style={{ marginBottom: 3 }}>
            {line}
          </li>
        ))}
      </ul>
    );
  }
  return <div style={textStyle}>{text}</div>;
}

function FieldRow({ k, st }) {
  const { npc, lang } = st;
  const byAi = npc.ai?.[k]?.lang === lang;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '142px minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'start',
        padding: '8px 0',
        borderTop: '1px solid var(--ds-line2)',
      }}
    >
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
        <span>{FIELD_LABELS[k][lang]}</span>
        {byAi && (
          <span title={COPY[lang].aiWritten} style={{ color: 'var(--ds-accent)' }}>
            <Icon name="wand" size={11} />
          </span>
        )}
      </div>
      <FieldValue k={k} st={st} />
      <FieldActions k={k} st={st} />
    </div>
  );
}

function IdentityLine({ k, st }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: 'var(--ds-muted)' }}>
        {fieldText(st.npc, k, st.lang)}
      </span>
      <FieldActions k={k} st={st} />
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
  const { npc, lang, isSaved, aiBusy } = st;
  const t = COPY[lang];
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    if (await copyText(toText(npc, lang))) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    }
  }

  const aiLabel = aiBusy
    ? t.aiBusy
    : Object.values(npc.ai || {}).some((a) => a.lang === lang)
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
      {npc.ai && (
        <Button variant="ghost" onClick={st.revertAi} style={small}>
          {t.aiRevert}
        </Button>
      )}
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
    </div>
  );
}

// Shown above the card while the NPC belongs to the current crowd.
export function CrowdBar({ st }) {
  const t = COPY[st.lang];
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 10,
      }}
    >
      <Button
        variant="secondary"
        icon={<Icon name="back" size={13} />}
        onClick={() => st.setView('crowd')}
        style={small}
      >
        {t.back}
      </Button>
      {st.npc.level !== 'key' && (
        <Button icon={<Icon name="dice" size={14} />} onClick={st.makeFull} style={small}>
          {t.makeFull}
        </Button>
      )}
    </div>
  );
}

export function NpcCard({ st }) {
  const { npc, lang } = st;
  const t = COPY[lang];
  const [asking, setAsking] = useState(false);
  const aiButtonRef = useRef(null);

  const visible = LEVEL_FIELDS[npc.level];
  const quote = fieldText(npc, 'quote', lang);
  const aiElsewhere = Object.values(npc.ai || {}).some((a) => a.lang !== lang);
  const error = st.aiError?.id === npc.id ? st.aiError.text : null;

  function closeQuestion() {
    setAsking(false);
    aiButtonRef.current?.focus();
  }

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <h2
          style={{
            flex: 1,
            minWidth: 0,
            margin: 0,
            fontFamily: SERIF,
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '.01em',
            color: 'var(--ds-text)',
          }}
        >
          {fieldText(npc, 'name', lang)}
        </h2>
        <FieldActions k="name" st={st} />
      </div>
      <IdentityLine k="who" st={st} />
      <IdentityLine k="occupation" st={st} />
      {quote && (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 14,
            lineHeight: 1.5,
            fontStyle: 'italic',
            color: 'var(--ds-text)',
          }}
        >
          {lang === 'ru' ? `«${quote}»` : `“${quote}”`}
        </p>
      )}

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
            st.deepen(hint);
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

      {SECTIONS.map((section) => {
        const keys = section.keys.filter((key) => visible.includes(key));
        if (!keys.length) return null;
        return (
          <section key={section.id} style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: '.22em',
                textTransform: 'uppercase',
                color: 'var(--ds-faint)',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {section[lang]}
            </div>
            {keys.map((key) => (
              <FieldRow key={key} k={key} st={st} />
            ))}
          </section>
        );
      })}

      {st.isSaved && (
        <section style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              color: 'var(--ds-faint)',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {t.notes}
          </div>
          <textarea
            aria-label={t.notes}
            value={npc.notes || ''}
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
