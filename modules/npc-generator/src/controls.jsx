// controls.jsx — the params column of the NPC Generator. Every option is
// optional; they apply to the next roll, except the level, which only changes
// how much of the current NPC is shown. UI chrome stays Russian, as in the
// Tavern Builder.
import { Button, Icon, SANS, Select, Slider, ToggleGroup } from '@dnd/design-system';
import { NPC_DATA as D } from './data.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const ruLabels = (list) => Object.fromEntries(list.map((o) => [o.id, o.ru]));
const ids = (list) => list.map((o) => o.id);

const OCC_OPTIONS = [
  { value: 'any', label: 'Любое' },
  ...D.occCategories.map((c) => ({ value: c.id, label: c.ru })),
];
const RACE_OPTIONS = [
  { value: 'any', label: 'Любая' },
  ...D.races.map((r) => ({ value: r.id, label: cap(r.ru) })),
];
const GENDER_LABELS = { any: 'Любой', m: 'Мужской', f: 'Женский' };

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

function ToneGrid({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
      {D.tones.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            className="ddtb-btn"
            onClick={() => onChange(o.id)}
            style={{
              gridColumn: o.id === 'any' ? '1 / -1' : undefined,
              padding: '7px 0',
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

export function NpcParams({ st }) {
  const { params, lang, view, crowdSize } = st;
  const isCrowd = view === 'crowd';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <ParamLabel>Важность</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={ids(D.levels)}
          value={params.level}
          onChange={st.setLevel}
          labels={ruLabels(D.levels)}
        />
      </div>
      <Select
        label="Занятие"
        value={params.occ}
        onChange={(e) => st.setParam('occ', e.target.value)}
        options={OCC_OPTIONS}
      />
      <Select
        label="Раса"
        value={params.race}
        onChange={(e) => st.setParam('race', e.target.value)}
        options={RACE_OPTIONS}
      />
      <div>
        <ParamLabel>Пол</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={['any', 'm', 'f']}
          value={params.gender}
          onChange={(v) => st.setParam('gender', v)}
          labels={GENDER_LABELS}
        />
      </div>
      <div>
        <ParamLabel>Тон</ParamLabel>
        <ToneGrid value={params.tone} onChange={(v) => st.setParam('tone', v)} />
      </div>
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
      {isCrowd && (
        <Slider
          label="Сколько человек"
          value={crowdSize}
          min={3}
          max={12}
          onChange={st.setCrowdSize}
        />
      )}
      <Button
        onClick={st.regenerate}
        icon={<Icon name="dice" size={15} />}
        style={{ width: '100%', fontSize: 12.5, letterSpacing: '.02em', whiteSpace: 'nowrap' }}
      >
        {isCrowd ? 'Создать толпу' : 'Создать NPC'}
      </Button>
      <div style={{ fontSize: 11, color: 'var(--ds-faint)', lineHeight: 1.5 }}>
        Замок на поле сохраняет его при новом броске.
      </div>
    </div>
  );
}
