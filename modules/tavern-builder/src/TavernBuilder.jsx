// TavernBuilder.jsx — Tavern Builder module (chosen layout A «Кабинет мастера»):
// params column on the left, section cards on the right. Generation is local
// (engine.js over data.js tables); only «Оживить описание» talks to Claude via
// the server proxy (api.js). Ported from the design handoff
// (design-reference/tavern-module.jsx).
import { useState, useEffect, useMemo } from 'react';
import { SANS } from '@dnd/design-system';
import { TAVERN_DATA as D } from './data.js';
import { generate, tavernName, blockKeys } from './engine.js';
import { TavernSection } from './blocks.jsx';
import { TavernParams, GenerateBtn } from './controls.jsx';
import { enlivenTavern } from './api.js';

const KEY = 'ddtb_tavern';
const DEFAULT_PARAMS = { tone: 'cozy', wealth: 1, size: 1 };

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

function aiErrorText(e, lang) {
  if (e?.code === 'free_quota_exhausted') {
    return lang === 'ru'
      ? 'Бесплатные генерации закончились — добавьте свой API-ключ Anthropic в Character Forge.'
      : 'Free generations used up — add your own Anthropic API key in Character Forge.';
  }
  if (e?.code === 'invalid_user_key') {
    return lang === 'ru'
      ? 'Неверный API-ключ — проверьте его в Character Forge.'
      : 'Invalid API key — check it in Character Forge.';
  }
  return lang === 'ru'
    ? 'Не удалось получить ответ — попробуйте ещё раз.'
    : 'Could not get a response — please try again.';
}

// Generator state: params / lang / locks / tavern, persisted as one key.
// Rerolling the identity block resets the AI description (genIdentity nulls it).
function useTavernState() {
  const saved = useMemo(loadSaved, []);
  const [params, setParams] = useState(saved?.params || DEFAULT_PARAMS);
  const [lang, setLang] = useState(saved?.lang || 'ru');
  const [locks, setLocks] = useState(saved?.locks || {});
  const [tavern, setTavern] = useState(
    () => saved?.tavern || generate(saved?.params || DEFAULT_PARAMS)
  );
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ params, lang, locks, tavern }));
    } catch {
      /* storage unavailable */
    }
  }, [params, lang, locks, tavern]);

  function setParam(k, v) {
    const np = { ...params, [k]: v };
    setParams(np);
    // a param change re-rolls the unlocked blocks with the new inputs
    setTavern((t) => generate(np, t, locks));
  }
  function regenerate() {
    setTavern((t) => generate(params, t, locks));
  }
  function reroll(key) {
    // re-roll exactly one block: lock everything else for this pass
    const only = {};
    blockKeys.forEach((k) => {
      only[k] = k !== key;
    });
    setTavern((t) => generate(params, t, only));
  }
  function toggleLock(key) {
    setLocks((l) => ({ ...l, [key]: !l[key] }));
  }

  async function enliven() {
    if (aiBusy) return;
    const name = tavernName(tavern, lang);
    const id = tavern.identity;
    const o = tavern.people.owner;
    const L = (e) => e[lang];
    const tone = D.tones.find((t) => t.id === params.tone);
    const facts = [
      lang === 'ru' ? `Название: «${name}»` : `Name: ${name}`,
      (lang === 'ru' ? 'Тон: ' : 'Tone: ') + L(tone),
      (lang === 'ru' ? 'Достаток: ' : 'Wealth: ') + L(D.wealthLabels[params.wealth]),
      (lang === 'ru' ? 'Поселение: ' : 'Settlement: ') + L(D.sizeLabels[params.size]),
      (lang === 'ru' ? 'Атмосфера: ' : 'Atmosphere: ') +
        [L(id.light), L(id.smell), L(id.detail), L(id.crowd)].join(' '),
      (lang === 'ru' ? 'Хозяин: ' : 'Owner: ') +
        `${L(o.name)} (${L(o.race)}). ${L(o.trait)} ${L(o.quirk)}`,
    ].join('\n');
    setAiBusy(true);
    try {
      const data = await enlivenTavern({ facts, lang });
      const text = String(data.text || '').trim();
      if (!text) throw new Error('empty');
      setTavern((t) => ({ ...t, identity: { ...t.identity, aiDesc: text, aiLang: lang } }));
    } catch (e) {
      setTavern((t) => ({
        ...t,
        identity: { ...t.identity, aiDesc: aiErrorText(e, lang), aiLang: lang },
      }));
    } finally {
      setAiBusy(false);
    }
  }

  return {
    tavern,
    params,
    lang,
    locks,
    setParam,
    setLang,
    regenerate,
    reroll,
    toggleLock,
    enliven,
    aiBusy,
  };
}

export default function TavernBuilder() {
  const st = useTavernState();
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '270px 1fr',
        overflow: 'hidden',
        fontFamily: SANS,
        color: 'var(--ds-text)',
      }}
    >
      <div
        style={{
          borderRight: '1px solid var(--ds-line2)',
          background: 'var(--ds-panel)',
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'auto',
        }}
      >
        <TavernParams params={st.params} lang={st.lang} onParam={st.setParam} onLang={st.setLang} />
        <div style={{ marginTop: 64 }}>
          <GenerateBtn onClick={st.regenerate} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--ds-faint)', lineHeight: 1.5 }}>
          Замок на блоке сохраняет его при переброске.
        </div>
      </div>
      <div style={{ overflow: 'auto', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 220,
            background: 'radial-gradient(70% 100% at 50% -20%, var(--ds-glow), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            padding: 20,
            display: 'grid',
            gridTemplateColumns: '1.06fr .94fr',
            gap: 14,
            alignItems: 'start',
            maxWidth: 1180,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TavernSection k="identity" st={st} />
            <TavernSection k="people" st={st} />
            <TavernSection k="rumors" st={st} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TavernSection k="menu" st={st} opts={{ menuColumn: true }} />
            <TavernSection k="patrons" st={st} />
          </div>
        </div>
      </div>
    </div>
  );
}
