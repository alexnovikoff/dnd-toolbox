# Adding a Module

A new tool is **three steps** — nothing in the sidebar or launcher is edited by
hand. That extensibility is the whole point of the architecture.

## 1. Create the package

```
modules/my-tool/
├─ package.json
└─ src/
   ├─ index.jsx       # { manifest, Component }
   └─ MyTool.jsx      # the component
```

`modules/my-tool/package.json`:

```json
{
  "name": "@dnd/my-tool",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.jsx",
  "exports": { ".": "./src/index.jsx" },
  "dependencies": { "@dnd/design-system": "workspace:*" },
  "peerDependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" }
}
```

## 2. Export `{ manifest, Component }`

```jsx
// modules/my-tool/src/index.jsx
import Component from './MyTool.jsx';

export const manifest = {
  id: 'my-tool',
  name: 'My Tool',
  description: 'What it does, briefly',
  group: 'creation',   // creation | assets | locations
  icon: 'wand',        // a name from @dnd/design-system icons
  accent: '#8a6cc0',   // permanent color tag (theme-independent)
  status: 'ready',     // ready | soon
};

export { Component };
```

Build the component with design-system primitives and `var(--ds-*)`:

```jsx
import { Button, Field, useTheme } from '@dnd/design-system';

export default function MyTool() {
  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--ds-bg)', padding: 24 }}>
      <Field label="Name" value="" onChange={() => {}} />
      <Button>Do the thing</Button>
    </div>
  );
}
```

## 3. Register it

```js
// apps/hub/src/registry.js
import * as myTool from '@dnd/my-tool';
export const MODULES = [characterForge, tokenCreator, myTool]; // ← one line
```

Then `pnpm install` (so the workspace link resolves). If the tool had a
placeholder in `apps/hub/src/comingSoon.js`, delete that entry.

## Checklist (DESIGN_SYSTEM.md §10)

- [ ] Registered in `registry.js`.
- [ ] Any new icon added to `@dnd/design-system` `icons.jsx`.
- [ ] Styling only via tokens/components — **no local hex** (except functional
      graphics like procedural frames).
- [ ] Works in both themes and with all six accents.
- [ ] Forms/buttons/cards come from the shared components.
- [ ] If it produces data worth keeping, state survives reload (`localStorage`).

## Needs the AI proxy?

If your module calls the model, POST to `/api/generate` and extend
`apps/hub/api/_core.js` with a new `mode`. Never put a key in the client. See
[[API Proxy|API-Proxy]].
