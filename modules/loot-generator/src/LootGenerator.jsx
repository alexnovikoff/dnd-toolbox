// LootGenerator.jsx — Loot Generator module: params on the left, the find on
// the right. The main roll is local and free (engine.js over the content
// tables). Claude is an optional extra step: its button appears once a find
// exists and every call goes through a Да/Нет question (card.jsx), via the
// server proxy.
import { useEffect, useMemo, useState } from 'react';
import { SANS, ToggleGroup } from '@dnd/design-system';
import {
  DEFAULT_PARAMS,
  DEFAULT_QUICK,
  aiKeep,
  aiTargets,
  applyAi,
  generate,
  itemLockKey,
  lootFacts,
  quickRoll,
  rerollField,
  rerollItem,
} from './engine.js';
import { enlivenLoot } from './api.js';
import { LootParams } from './controls.jsx';
import { HaulCard } from './card.jsx';
import { QuickPanel } from './quick.jsx';
import { EmptyCard, SavedList } from './lists.jsx';
import { COPY } from './copy.js';

const KEY = 'ddtb_loot';
const PICKS_MAX = 40;

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

// An item that left the card can't be locked any more.
function pruneLocks(locks, haul) {
  const live = new Set(haul.items.map((line) => itemLockKey(line.uid)));
  return Object.fromEntries(
    Object.entries(locks).filter(([key, on]) => on && (!key.startsWith('item:') || live.has(key)))
  );
}

function useLootState() {
  const stored = useMemo(loadSaved, []);
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, ...stored?.params });
  const [lang, setLang] = useState(stored?.lang || 'ru');
  const [locks, setLocks] = useState(stored?.locks || {});
  const [view, setView] = useState(stored?.view || 'haul');
  const [haul, setHaul] = useState(stored?.haul || null);
  const [library, setLibrary] = useState(stored?.saved || []);
  const [picks, setPicks] = useState(stored?.picks || []);
  const [quickOpts, setQuickOpts] = useState({ ...DEFAULT_QUICK, ...stored?.quickOpts });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState(null); // { id, text }
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ params, lang, locks, view, haul, saved: library, picks, quickOpts })
      );
    } catch {
      /* storage unavailable */
    }
  }, [params, lang, locks, view, haul, library, picks, quickOpts]);

  // A saved find and the one on the card are the same find, so edits reach
  // every copy and going back to the list never loses them.
  function updateHaul(next) {
    setHaul(next);
    setLibrary((list) => list.map((item) => (item.id === next.id ? next : item)));
  }

  function setParam(key, value) {
    setParams((p) => ({ ...p, [key]: value }));
  }

  function regenerate() {
    const next = generate(params, haul, locks);
    setHaul(next);
    setLocks((l) => pruneLocks(l, next));
    setView('haul');
  }

  function open(item) {
    setHaul(item);
    setView('haul');
  }

  async function enliven(hint) {
    if (aiBusy || !haul) return;
    const target = haul;
    const targets = aiTargets(target, locks);
    setAiBusy(true);
    setAiError(null);
    try {
      const data = await enlivenLoot({
        kind: target.kind,
        facts: lootFacts(target, lang),
        keep: aiKeep(target, locks),
        hint,
        lang,
      });
      if (data.remaining != null) setRemaining(data.remaining);
      if (!applyAi(target, data.fields, targets, lang)) throw new Error('empty answer');
      // The GM may have rolled something new while waiting: the answer belongs
      // to the find it was asked about, wherever that find is now.
      const merge = (item) =>
        item && item.id === target.id ? applyAi(item, data.fields, targets, lang) : item;
      setHaul(merge);
      setLibrary((list) => list.map(merge));
    } catch (e) {
      setAiError({ id: target.id, text: aiErrorText(e, lang) });
    } finally {
      setAiBusy(false);
    }
  }

  return {
    params,
    lang,
    locks,
    view,
    haul,
    library,
    picks,
    quickOpts,
    aiBusy,
    aiError,
    remaining,
    isSaved: !!haul && library.some((item) => item.id === haul.id),
    setParam,
    setLang,
    setView,
    regenerate,
    open,
    enliven,
    reroll: (key) => updateHaul(rerollField(haul, key)),
    rerollItem: (uid) => updateHaul(rerollItem(haul, uid)),
    toggleLock: (key) => setLocks((l) => ({ ...l, [key]: !l[key] })),
    revertAi: () => updateHaul({ ...haul, ai: null }),
    setNotes: (notes) => updateHaul({ ...haul, notes }),
    save: () => setLibrary((list) => [haul, ...list]),
    remove: (id) => setLibrary((list) => list.filter((item) => item.id !== id)),
    setQuickOpt: (key, value) => setQuickOpts((o) => ({ ...o, [key]: value })),
    quickRoll: (type) =>
      setPicks((list) => [quickRoll(type, quickOpts, params.tier), ...list].slice(0, PICKS_MAX)),
    removePick: (id) => setPicks((list) => list.filter((pick) => pick.id !== id)),
    clearPicks: () => setPicks([]),
  };
}

function viewLabels(count) {
  return {
    haul: 'Добыча',
    quick: 'По отдельности',
    saved: count ? `Мои клады · ${count}` : 'Мои клады',
  };
}

export default function LootGenerator() {
  const st = useLootState();
  const t = COPY[st.lang];
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '312px 1fr',
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
          overflow: 'auto',
        }}
      >
        <LootParams st={st} />
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
        <div style={{ position: 'relative', padding: 20, maxWidth: 780 }}>
          <div style={{ maxWidth: 400, marginBottom: 14 }}>
            <ToggleGroup
              variant="segment"
              options={['haul', 'quick', 'saved']}
              value={st.view}
              onChange={st.setView}
              labels={viewLabels(st.library.length)}
            />
          </div>
          {st.view === 'haul' &&
            (st.haul ? (
              <HaulCard key={st.haul.id} st={st} />
            ) : (
              <EmptyCard title={t.emptyTitle} text={t.emptyText} />
            ))}
          {st.view === 'quick' && <QuickPanel st={st} />}
          {st.view === 'saved' && <SavedList st={st} />}
        </div>
      </div>
    </div>
  );
}
