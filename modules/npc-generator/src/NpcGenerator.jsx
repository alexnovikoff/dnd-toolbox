// NpcGenerator.jsx — NPC Generator module: params on the left, the NPC on the
// right. The main roll is local and free (engine.js over the content tables).
// Claude is an optional extra step: its button appears once an NPC exists and
// every call goes through a Да/Нет question (card.jsx), via the server proxy.
import { useEffect, useMemo, useState } from 'react';
import { SANS, ToggleGroup } from '@dnd/design-system';
import {
  DEFAULT_PARAMS,
  FIELD_KEYS,
  aiTargets,
  applyAi,
  completeNpc,
  crowd,
  generate,
  npcFacts,
  rerollField,
} from './engine.js';
import { deepenNpc } from './api.js';
import { NpcParams } from './controls.jsx';
import { CrowdBar, NpcCard } from './card.jsx';
import { CrowdList, EmptyCard, SavedList } from './lists.jsx';
import { COPY } from './copy.js';

const KEY = 'ddtb_npc';
const DEFAULT_CROWD = 5;

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

function useNpcState() {
  const stored = useMemo(loadSaved, []);
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, ...stored?.params });
  const [lang, setLang] = useState(stored?.lang || 'ru');
  const [locks, setLocks] = useState(stored?.locks || {});
  const [view, setView] = useState(stored?.view || 'npc');
  const [crowdSize, setCrowdSize] = useState(stored?.crowdSize || DEFAULT_CROWD);
  const [npc, setNpc] = useState(stored?.npc || null);
  const [people, setPeople] = useState(stored?.crowd || []);
  const [library, setLibrary] = useState(stored?.saved || []);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState(null); // { id, text }
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          params,
          lang,
          locks,
          view,
          crowdSize,
          npc,
          crowd: people,
          saved: library,
        })
      );
    } catch {
      /* storage unavailable */
    }
  }, [params, lang, locks, view, crowdSize, npc, people, library]);

  // A saved or crowd NPC is the same person as the one on the card, so edits
  // reach every copy and going back to the list never loses them.
  function updateNpc(next) {
    const replace = (list) => list.map((item) => (item.id === next.id ? next : item));
    setNpc(next);
    setLibrary(replace);
    setPeople(replace);
  }

  function setParam(key, value) {
    setParams((p) => ({ ...p, [key]: value }));
  }

  // The level only changes how much is shown: an NPC can grow into a bigger
  // role mid-campaign without being rerolled.
  function setLevel(level) {
    setParam('level', level);
    if (npc) updateNpc({ ...npc, level });
  }

  // The full form of a crowd NPC: nothing already on the card changes.
  function makeFull() {
    updateNpc(completeNpc(npc, params, locks));
    setParam('level', 'key');
  }

  function regenerate() {
    if (view === 'crowd') {
      setPeople(crowd(params, crowdSize));
      return;
    }
    setNpc(generate(params, npc, locks));
    setView('npc');
  }

  function open(item) {
    setNpc(item);
    setParam('level', item.level);
    setView('npc');
  }

  async function deepen(hint) {
    if (aiBusy || !npc) return;
    const target = npc;
    const targets = aiTargets(target, locks);
    setAiBusy(true);
    setAiError(null);
    try {
      const data = await deepenNpc({
        facts: npcFacts(target, lang),
        level: target.level,
        keep: FIELD_KEYS.filter((key) => locks[key]),
        hint,
        gender: target.who.gender === 'f' ? 'female' : 'male',
        lang,
      });
      if (data.remaining != null) setRemaining(data.remaining);
      if (!applyAi(target, data.fields, targets, lang)) throw new Error('empty answer');
      // The GM may have rolled someone new while waiting: the answer belongs
      // to the NPC it was asked about, wherever that NPC is now.
      const merge = (item) =>
        item && item.id === target.id ? applyAi(item, data.fields, targets, lang) : item;
      setNpc(merge);
      setLibrary((list) => list.map(merge));
      setPeople((list) => list.map(merge));
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
    crowdSize,
    npc,
    people,
    library,
    aiBusy,
    aiError,
    remaining,
    isSaved: !!npc && library.some((item) => item.id === npc.id),
    fromCrowd: !!npc && people.some((item) => item.id === npc.id),
    setParam,
    setLevel,
    setLang,
    setView,
    setCrowdSize,
    regenerate,
    open,
    deepen,
    makeFull,
    reroll: (key) => updateNpc(rerollField(npc, key, params, locks)),
    toggleLock: (key) => setLocks((l) => ({ ...l, [key]: !l[key] })),
    revertAi: () => updateNpc({ ...npc, ai: null }),
    setNotes: (notes) => updateNpc({ ...npc, notes }),
    save: () => setLibrary((list) => [npc, ...list]),
    remove: (id) => setLibrary((list) => list.filter((item) => item.id !== id)),
  };
}

function viewLabels(count) {
  return { npc: 'NPC', crowd: 'Толпа', saved: count ? `Мои NPC · ${count}` : 'Мои NPC' };
}

export default function NpcGenerator() {
  const st = useNpcState();
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
        <NpcParams st={st} />
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
          <div style={{ maxWidth: 340, marginBottom: 14 }}>
            <ToggleGroup
              variant="segment"
              options={['npc', 'crowd', 'saved']}
              value={st.view}
              onChange={st.setView}
              labels={viewLabels(st.library.length)}
            />
          </div>
          {st.view === 'npc' &&
            (st.npc ? (
              <>
                {st.fromCrowd && <CrowdBar st={st} />}
                <NpcCard key={st.npc.id} st={st} />
              </>
            ) : (
              <EmptyCard title={t.emptyTitle} text={t.emptyText} />
            ))}
          {st.view === 'crowd' && <CrowdList st={st} />}
          {st.view === 'saved' && <SavedList st={st} />}
        </div>
      </div>
    </div>
  );
}
