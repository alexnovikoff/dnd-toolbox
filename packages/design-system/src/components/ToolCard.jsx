import { Icon } from '../icons.jsx';
import { SERIF } from '../constants.js';
import { IconChip } from './IconChip.jsx';
import { StatusTag } from './StatusTag.jsx';

// Pick the footer icon for the tile variant from the module group key.
function groupIcon(group) {
  if (group === 'locations' || group === 'Локации') return 'pin';
  if (group === 'assets' || group === 'Ассеты') return 'grid';
  return 'wand';
}

// ToolCard — three variants: 'feature' | 'tile' | 'row'.
// `tool` is a module manifest (or manifest-shaped object). `groupLabel` is the
// localized display label for the tool's group (the manifest stores a key).
export function ToolCard({ tool, variant = 'tile', groupLabel }) {
  const desc = tool.description ?? tool.desc ?? '';
  const dim = tool.status === 'soon';
  const gLabel = groupLabel ?? tool.group;

  if (variant === 'row') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '13px 15px',
          background: 'var(--ds-panel)',
          border: '1px solid var(--ds-line2)',
          borderRadius: 12,
          opacity: dim ? 0.72 : 1,
        }}
      >
        <IconChip icon={tool.icon} accent={tool.accent} size={40} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ds-text)' }}>{tool.name}</div>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--ds-muted)',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {desc}
          </div>
        </div>
        <StatusTag status={tool.status} />
        <span style={{ color: 'var(--ds-faint)', display: 'flex' }}>
          <Icon name="chevron" size={18} />
        </span>
      </div>
    );
  }

  if (variant === 'feature') {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: 22,
          background: 'linear-gradient(160deg, var(--ds-raised), var(--ds-panel))',
          border: '1px solid var(--ds-line)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,.3), 0 0 0 1px var(--ds-line2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 80% at 100% 0%, ${tool.accent}1f, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <IconChip icon={tool.icon} accent={tool.accent} size={54} />
          <StatusTag status={tool.status} />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 21,
            fontWeight: 600,
            color: 'var(--ds-text)',
            marginTop: 18,
            letterSpacing: '.01em',
            position: 'relative',
          }}
        >
          {tool.name}
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--ds-muted)',
            marginTop: 7,
            lineHeight: 1.5,
            position: 'relative',
          }}
        >
          {desc}
        </div>
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            color: 'var(--ds-accent)',
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: '.04em',
            position: 'relative',
          }}
        >
          Открыть <Icon name="chevron" size={15} />
        </div>
      </div>
    );
  }

  // tile (default)
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: 18,
        background: 'var(--ds-panel)',
        border: '1px solid var(--ds-line2)',
        borderRadius: 14,
        opacity: dim ? 0.78 : 1,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <IconChip icon={tool.icon} accent={tool.accent} size={46} />
        <StatusTag status={tool.status} />
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--ds-text)',
          marginTop: 16,
          letterSpacing: '.01em',
        }}
      >
        {tool.name}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ds-muted)', marginTop: 6, lineHeight: 1.5 }}>
        {desc}
      </div>
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--ds-line2)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--ds-faint)',
          fontWeight: 600,
        }}
      >
        <Icon name={groupIcon(tool.group)} size={13} /> {gLabel}
      </div>
    </div>
  );
}
