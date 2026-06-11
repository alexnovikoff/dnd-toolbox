// controls.jsx — the params column controls for the Tavern Builder.
// Ported from the design handoff (design-reference/tavern-ui.jsx): tone grid
// 2×2 + segment controls. UI chrome stays Russian — only content translates.
import { Button, Icon, SANS, ToggleGroup } from '@dnd/design-system';
import { TAVERN_DATA as D } from './data.js';

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

const ruLabels = (arr) => Object.fromEntries(arr.map((e, i) => [i, e.ru]));

export function TavernParams({ params, lang, onParam, onLang }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <ParamLabel>Атмосфера</ParamLabel>
        <ToneGrid value={params.tone} onChange={(v) => onParam('tone', v)} />
      </div>
      <div>
        <ParamLabel>Достаток</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={[0, 1, 2]}
          value={params.wealth}
          onChange={(v) => onParam('wealth', v)}
          labels={ruLabels(D.wealthLabels)}
        />
      </div>
      <div>
        <ParamLabel>Поселение</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={[0, 1, 2]}
          value={params.size}
          onChange={(v) => onParam('size', v)}
          labels={ruLabels(D.sizeLabels)}
        />
      </div>
      <div>
        <ParamLabel>Язык контента</ParamLabel>
        <ToggleGroup
          variant="segment"
          options={['ru', 'en']}
          value={lang}
          onChange={onLang}
          labels={{ ru: 'РУС', en: 'ENG' }}
        />
      </div>
    </div>
  );
}

export function GenerateBtn({ onClick }) {
  return (
    <Button
      onClick={onClick}
      icon={<Icon name="dice" size={15} />}
      style={{ width: '100%', fontSize: 12.5, letterSpacing: '.02em', whiteSpace: 'nowrap' }}
    >
      Сгенерировать
    </Button>
  );
}
