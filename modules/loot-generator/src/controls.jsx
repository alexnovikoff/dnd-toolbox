// controls.jsx — the params column of the Loot Generator. Every option is
// optional and applies to the next roll; the party size only changes the share
// shown on the card. UI chrome stays Russian, as in the other generators.
import { Button, Icon, SANS, Slider, ToggleGroup } from '@dnd/design-system';
import { LOOT_DATA as D } from './data.js';

const ROLL_LABELS = {
  hoard: 'Создать клад',
  dragon: 'Создать логово',
  reward: 'Создать награду',
  pockets: 'Обыскать тела',
};

const ruLabels = (list) => Object.fromEntries(list.map((o) => [o.id, o.ru]));
const ids = (list) => list.map((o) => o.id);
const TIER_IDS = ids(D.tiers);

const usesTheme = (kind) => kind === 'hoard' || kind === 'dragon';

function ParamLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--ds-faint)',
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

// Two columns of plain choices; the first one can stretch across both.
function ChoiceGrid({ options, value, onChange, firstWide }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            className="ddtb-btn"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            style={{
              gridColumn: firstWide && i === 0 ? '1 / -1' : undefined,
              padding: '7px 4px',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 11.5,
              fontWeight: 600,
              border: `1px solid ${on ? 'var(--ds-line)' : 'var(--ds-line2)'}`,
              background: on ? 'var(--ds-glow)' : 'var(--ds-raised)',
              color: on ? 'var(--ds-accent)' : 'var(--ds-muted)',
            }}
          >
            {o.ru}
          </button>
        );
      })}
    </div>
  );
}

// CC BY 4.0 asks for this notice as written; the sentence after it says what
// was changed. Nothing else may be attributed to the rights holder here.
function SrdNotice() {
  return (
    <p style={{ margin: 0, fontSize: 10, lineHeight: 1.5, color: 'var(--ds-faint)' }}>
      This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards
      of the Coast LLC, available at{' '}
      <a
        href="https://www.dndbeyond.com/srd"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
      >
        https://www.dndbeyond.com/srd
      </a>
      . The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License,
      available at{' '}
      <a
        href="https://creativecommons.org/licenses/by/4.0/legalcode"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
      >
        https://creativecommons.org/licenses/by/4.0/legalcode
      </a>
      . Названия предметов и заклинаний переведены, описания пересказаны.
    </p>
  );
}

export function LootParams({ st }) {
  const { params, lang, view } = st;
  const isQuick = view === 'quick';
  const tierLabels = Object.fromEntries(
    D.tiers.map((t) => [t.id, params.kind === 'reward' ? t.party : t.cr])
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!isQuick && (
        <div>
          <ParamLabel>Вид добычи</ParamLabel>
          <ChoiceGrid
            options={D.kinds}
            value={params.kind}
            onChange={(v) => st.setParam('kind', v)}
          />
        </div>
      )}
      <div>
        <ParamLabel>
          {params.kind === 'reward' && !isQuick ? 'Уровень партии' : 'Опасность (CR)'}
        </ParamLabel>
        <ToggleGroup
          variant="segment"
          options={TIER_IDS}
          value={params.tier}
          onChange={(v) => st.setParam('tier', v)}
          labels={tierLabels}
        />
      </div>
      {!isQuick && usesTheme(params.kind) && (
        <div>
          <ParamLabel>Тема</ParamLabel>
          <ChoiceGrid
            options={D.themes}
            value={params.theme}
            onChange={(v) => st.setParam('theme', v)}
            firstWide
          />
        </div>
      )}
      {!isQuick && (
        <div>
          <ParamLabel>Щедрость</ParamLabel>
          <ToggleGroup
            variant="segment"
            options={ids(D.bounties)}
            value={params.bounty}
            onChange={(v) => st.setParam('bounty', v)}
            labels={ruLabels(D.bounties)}
          />
        </div>
      )}
      {!isQuick && params.kind === 'pockets' && (
        <Slider
          label="Сколько существ"
          value={params.bodies}
          min={1}
          max={12}
          onChange={(v) => st.setParam('bodies', v)}
        />
      )}
      {!isQuick && (
        <Slider
          label="Размер партии"
          value={params.party}
          min={1}
          max={8}
          onChange={(v) => st.setParam('party', v)}
        />
      )}
      <div>
        <ParamLabel>Язык контента</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={['ru', 'en']}
          value={lang}
          onChange={st.setLang}
          labels={{ ru: 'РУС', en: 'ENG' }}
        />
      </div>
      {!isQuick && (
        <Button
          onClick={st.regenerate}
          icon={<Icon name="dice" size={15} />}
          style={{ width: '100%', fontSize: 12.5, letterSpacing: '.02em', whiteSpace: 'nowrap' }}
        >
          {ROLL_LABELS[params.kind]}
        </Button>
      )}
      {!isQuick && (
        <div style={{ fontSize: 11, color: 'var(--ds-faint)', lineHeight: 1.5 }}>
          Замок на строке сохраняет её при новом броске.
        </div>
      )}
      <SrdNotice />
    </div>
  );
}
