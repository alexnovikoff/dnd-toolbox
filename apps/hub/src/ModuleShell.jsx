// ModuleShell.jsx — wraps a module in the design-system AppShell. The sidebar
// nav is built from all manifests (ready modules + coming-soon placeholders).
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AppShell } from '@dnd/design-system';
import { getModule, manifests } from './registry.js';
import { COMING_SOON } from './comingSoon.js';
import { GROUPS, groupLabel } from './groups.js';

export default function ModuleShell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mod = getModule(id);

  if (!mod) return <Navigate to="/" replace />;

  const { manifest, Component } = mod;
  const all = [...manifests, ...COMING_SOON];
  const groups = GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    items: all.filter((m) => m.group === g.key),
  })).filter((g) => g.items.length > 0);

  return (
    <AppShell
      active={manifest}
      groups={groups}
      groupLabel={groupLabel(manifest.group)}
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
      onNavigate={(tid) => navigate('/tool/' + tid)}
    >
      <Component />
    </AppShell>
  );
}
