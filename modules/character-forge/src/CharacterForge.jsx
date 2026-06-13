// CharacterForge.jsx — multilingual D&D character generator.
// Ported from the standalone dnd-character-generator; all chrome now uses the
// design system, and generation goes through the server proxy (./api.js).
import { useState, useCallback } from 'react';
import { Icon, Button, Field, Select, ToggleGroup, SANS, SERIF } from '@dnd/design-system';
import { UI, LANGUAGES, RACES, CLASSES, FIRST_NAMES, LAST_NAMES, randL, sanitize } from './i18n.js';
import {
  generateCharacter,
  generateForge,
  regenerateSection,
  getUserKey,
  setUserKey,
} from './api.js';
import { TAB_IDS, TAB_MODE, TAB_FIELDS, tabLabel, fieldLabel } from './forge-tabs.js';

function Dice({ onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="ddtb-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        color: 'var(--ds-muted)',
        cursor: 'pointer',
        padding: 2,
      }}
    >
      <Icon name="dice" size={18} />
    </button>
  );
}

const card = {
  background: 'var(--ds-panel)',
  border: '1px solid var(--ds-line2)',
  borderRadius: 14,
  padding: 24,
};

export default function CharacterForge() {
  const [lang, setLang] = useState('ru');
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [cls, setCls] = useState('');
  const [vibe, setVibe] = useState('');
  const [gender, setGender] = useState('male');
  const [length, setLength] = useState('normal');
  // Per-tab state: each tab keeps its own result/loading/error so switching
  // tabs never discards an already-generated result.
  const [activeTab, setActiveTab] = useState('classic');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [regenLoading, setRegenLoading] = useState({});
  const [copied, setCopied] = useState(false);
  const [userKey, setUserKeyState] = useState(() => getUserKey());
  const [remaining, setRemaining] = useState(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');

  const t = UI[lang];
  const result = results[activeTab] || null;
  const isLoading = !!loading[activeTab];
  const tabError = error[activeTab] || '';

  const handleApiError = useCallback(
    (e, tab) => {
      const set = (msg) => setError((p) => ({ ...p, [tab]: msg }));
      if (e?.code === 'free_quota_exhausted') {
        setRemaining(0);
        setKeyOpen(true);
        set(t.freeLimitText);
      } else if (e?.code === 'invalid_user_key') {
        setKeyOpen(true);
        set(t.invalidKey);
      } else {
        set(e?.message || 'Something went wrong. Please try again.');
      }
    },
    [t]
  );

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    setUserKey(k);
    setUserKeyState(k);
    setKeyDraft('');
    setError({});
  };

  const clearKey = () => {
    setUserKey('');
    setUserKeyState('');
    setKeyDraft('');
  };

  const rollName = () => setName(`${randL(FIRST_NAMES, lang)} ${randL(LAST_NAMES, lang)}`);
  const rollRace = () => setRace(randL(RACES, lang));
  const rollCls = () => setCls(randL(CLASSES, lang));

  const generate = useCallback(async () => {
    const sName = sanitize(name);
    const sRace = sanitize(race);
    const sCls = sanitize(cls);
    const sVibe = sanitize(vibe);
    const tab = activeTab;
    if (!sName && !sRace && !sCls) {
      setError((p) => ({ ...p, [tab]: t.error }));
      return;
    }
    setError((p) => ({ ...p, [tab]: '' }));
    setLoading((p) => ({ ...p, [tab]: true }));
    setResults((p) => ({ ...p, [tab]: null }));
    try {
      const mode = TAB_MODE[tab];
      const params = { name: sName, race: sRace, cls: sCls, vibe: sVibe, gender, length, lang };
      const data =
        mode === 'full' ? await generateCharacter(params) : await generateForge(mode, params);
      setResults((p) => ({ ...p, [tab]: { ...data.fields, name: sName, race: sRace, cls: sCls } }));
      if (data.remaining != null) setRemaining(data.remaining);
    } catch (e) {
      handleApiError(e, tab);
    }
    setLoading((p) => ({ ...p, [tab]: false }));
  }, [name, race, cls, vibe, lang, gender, length, t, handleApiError, activeTab]);

  // Per-section ↺ regenerate — classic tab only (v1).
  const regenSection = useCallback(
    async (sec) => {
      const current = results.classic;
      if (!current) return;
      setRegenLoading((p) => ({ ...p, [sec]: true }));
      try {
        const data = await regenerateSection({
          section: sec,
          character: current,
          gender,
          length,
          lang,
        });
        setResults((p) => ({ ...p, classic: { ...p.classic, ...data.fields } }));
        if (data.remaining != null) setRemaining(data.remaining);
      } catch (e) {
        if (e?.code === 'free_quota_exhausted' || e?.code === 'invalid_user_key') {
          handleApiError(e, 'classic');
        }
        /* otherwise keep previous content */
      }
      setRegenLoading((p) => ({ ...p, [sec]: false }));
    },
    [results.classic, lang, gender, length, handleApiError]
  );

  const copyAll = useCallback(async () => {
    const current = results[activeTab];
    if (!current) return;
    const header = `${current.name || '?'} — ${current.race || '?'} ${current.cls || '?'}`;
    const body = TAB_FIELDS[activeTab]
      .map((f) => `${f.emoji} ${fieldLabel(activeTab, f, lang)}: ${current[f.key]}`)
      .join('\n');
    const txt = `${header}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const el = document.createElement('textarea');
      el.value = txt;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results, activeTab, lang]);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--ds-bg)',
        color: 'var(--ds-text)',
        padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 30,
              fontWeight: 700,
              color: 'var(--ds-accent)',
              letterSpacing: '.04em',
            }}
          >
            {t.title}
          </h1>
          <p style={{ margin: '8px 0 14px', color: 'var(--ds-muted)', fontSize: 14 }}>{t.subtitle}</p>
          <div style={{ display: 'inline-flex', minWidth: 200 }}>
            <Select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag} ${l.label}` }))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Generation tabs: classic first, then the alternative lenses */}
        <div style={{ marginBottom: 18 }}>
          <ToggleGroup
            options={TAB_IDS}
            value={activeTab}
            onChange={setActiveTab}
            labels={Object.fromEntries(TAB_IDS.map((id) => [id, tabLabel(id, lang)]))}
          />
        </div>

        {/* Input card */}
        <div style={{ ...card, marginBottom: 24 }}>
          <Field
            label={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder ?? UI.en.namePlaceholder}
            right={<Dice label={t.name} onClick={rollName} />}
            style={{ marginBottom: 14 }}
          />
          <Field
            label={t.race}
            value={race}
            onChange={(e) => setRace(e.target.value)}
            placeholder={t.racePlaceholder ?? UI.en.racePlaceholder}
            right={<Dice label={t.race} onClick={rollRace} />}
            style={{ marginBottom: 14 }}
          />
          <Field
            label={t.cls}
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            placeholder={t.clsPlaceholder ?? UI.en.clsPlaceholder}
            right={<Dice label={t.cls} onClick={rollCls} />}
            style={{ marginBottom: 14 }}
          />
          <Field
            label={t.vibe}
            hint={t.vibeOpt}
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder={t.vibePlaceholder}
            style={{ marginBottom: 14 }}
          />

          <div style={{ marginBottom: 14 }}>
            <div style={LABEL}>{t.gender}</div>
            <ToggleGroup
              options={['male', 'female', 'other']}
              value={gender}
              onChange={setGender}
              labels={{ male: t.male, female: t.female, other: t.other }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={LABEL}>{t.length}</div>
            <ToggleGroup
              options={['short', 'normal', 'long']}
              value={length}
              onChange={setLength}
              labels={{ short: t.short, normal: t.normal, long: t.long }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() => {
                rollName();
                rollRace();
                rollCls();
              }}
            >
              {t.randomAll}
            </Button>
            <Button onClick={generate} disabled={isLoading} style={{ flex: 1, fontSize: 15, padding: '12px 24px' }}>
              {isLoading ? t.generating : t.generate}
            </Button>
          </div>
          {tabError && (
            <p style={{ margin: '12px 0 0', color: 'var(--ds-danger)', fontSize: 13 }}>{tabError}</p>
          )}

          {/* Free tier / own API key */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid var(--ds-line2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ds-faint)' }}>
              {userKey ? t.usingOwnKey : remaining != null ? t.freeLeft.replace('{n}', remaining) : ''}
            </span>
            <button
              type="button"
              className="ddtb-btn"
              onClick={() => setKeyOpen((o) => !o)}
              style={KEY_TOGGLE}
            >
              <Icon name="gear" size={13} /> {t.apiKey}
            </button>
          </div>
          {keyOpen && (
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 10,
                background: 'var(--ds-raised)',
                border: '1px solid var(--ds-line2)',
              }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveKey();
                  }}
                  placeholder={userKey ? '••••••••••••' : t.keyPlaceholder}
                  autoComplete="off"
                  style={KEY_INPUT}
                />
                <Button onClick={saveKey} disabled={!keyDraft.trim()} style={{ padding: '9px 16px', fontSize: 13 }}>
                  {t.save}
                </Button>
                {userKey && (
                  <Button variant="secondary" onClick={clearKey} style={{ padding: '9px 14px', fontSize: 13 }}>
                    {t.clearKey}
                  </Button>
                )}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ds-faint)' }}>
                {t.keyNote}{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--ds-accent)' }}
                >
                  {t.getKey}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ds-muted)' }}>
            <div style={{ fontSize: 32, animation: 'ddtb-pulse 1.5s infinite' }}>🔮</div>
            <p style={{ marginTop: 12 }}>{t.fates}</p>
          </div>
        )}

        {/* Result card (active tab) */}
        {result && !isLoading && (
          <div
            style={{
              animation: 'ddtb-fadeIn 0.4s ease',
              background: 'var(--ds-panel)',
              border: '1px solid var(--ds-line)',
              borderRadius: 14,
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 24, color: 'var(--ds-accent)' }}>
                  {result.name || '—'}
                </h2>
                <p style={{ margin: '4px 0 0', color: 'var(--ds-muted)', fontSize: 14 }}>
                  {[result.race, result.cls].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={copyAll} style={{ padding: '8px 16px' }}>
                  {copied ? t.copied : t.copyAll}
                </Button>
                <Button variant="secondary" onClick={generate} style={{ padding: '8px 16px' }}>
                  {t.redo}
                </Button>
              </div>
            </div>

            {TAB_FIELDS[activeTab].map((field) => {
              const sec = field.key;
              const canRegen = activeTab === 'classic';
              return (
                <div
                  key={sec}
                  style={{
                    background: 'var(--ds-raised)',
                    borderRadius: 10,
                    padding: 18,
                    marginBottom: 14,
                    border: '1px solid var(--ds-line2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: 'var(--ds-accent)',
                        fontFamily: SANS,
                      }}
                    >
                      <Icon name={field.icon} size={15} /> {fieldLabel(activeTab, field, lang)}
                    </h3>
                    {canRegen && (
                      <button
                        onClick={() => regenSection(sec)}
                        disabled={regenLoading[sec]}
                        className="ddtb-btn"
                        style={{
                          flex: '0 0 auto',
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid var(--ds-line2)',
                          background: 'transparent',
                          color: 'var(--ds-muted)',
                          cursor: regenLoading[sec] ? 'not-allowed' : 'pointer',
                          fontSize: 12,
                          fontFamily: SANS,
                        }}
                      >
                        {regenLoading[sec] ? '…' : t.redo}
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--ds-text)' }}>
                    {regenLoading[sec] ? (
                      <span style={{ animation: 'ddtb-pulse 1s infinite', display: 'inline-block' }}>
                        …
                      </span>
                    ) : (
                      result[sec]
                    )}
                  </p>
                </div>
              );
            })}

            <Button
              variant="secondary"
              onClick={generate}
              style={{
                width: '100%',
                marginTop: 8,
                padding: 12,
                border: '1px solid var(--ds-line)',
                color: 'var(--ds-accent)',
              }}
            >
              {t.generateNew}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const LABEL = {
  fontSize: 10.5,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--ds-faint)',
  fontWeight: 700,
  marginBottom: 7,
  display: 'block',
};

const KEY_TOGGLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  borderRadius: 8,
  border: '1px solid var(--ds-line2)',
  background: 'transparent',
  color: 'var(--ds-muted)',
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: SANS,
};

const KEY_INPUT = {
  flex: 1,
  minWidth: 180,
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid var(--ds-line2)',
  background: 'var(--ds-panel)',
  color: 'var(--ds-text)',
  fontSize: 13,
  fontFamily: SANS,
  outline: 'none',
};
