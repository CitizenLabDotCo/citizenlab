import { SerializedNodes, SerializedNode } from '@craftjs/core';

import widgetMessages from './Widgets/messages';

// While the new project page rolls out alongside the legacy one, the page
// structure is frozen so both render the same sections in the same order:
//
//   ROOT (ProjectPageRoot, canMoveIn: false)   ← rejects all drops
//     ├─ Project image (locked)
//     ├─ Title         (locked)
//     └─ ProjectPageBody (canMoveIn: false)    ← fixed section order
//          ├─ Description section              ← the only editable region;
//          │                                      also edited via the legacy
//          │                                      description editor
//          ├─ Phases (locked)                  ← timeline + phase content as
//          │                                      ONE widget: the timeline's
//          │                                      tabs drive the content, so
//          │                                      they always move together
//          └─ Events (locked)
//
// The locks live in code — `normalizeProjectPageLayout` re-stamps them on every
// load — so unlocking at launch is a code change that instantly applies to
// every stored layout, with no data migration.
export const BANNER_NODE_ID = 'PROJECT_PAGE_BANNER';
export const TITLE_NODE_ID = 'PROJECT_PAGE_TITLE';
export const BODY_NODE_ID = 'PROJECT_PAGE_BODY';
export const DESCRIPTION_NODE_ID = 'PROJECT_PAGE_DESCRIPTION';
export const PHASES_NODE_ID = 'PROJECT_PAGE_PHASES';
export const EVENTS_NODE_ID = 'PROJECT_PAGE_EVENTS';

const ROOT_ID = 'ROOT';

const bannerNode = (): SerializedNode => ({
  type: { resolvedName: 'ProjectBanner' },
  nodes: [],
  props: { image: {}, alt: {} },
  custom: {
    title: widgetMessages.bannerWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  hidden: false,
  parent: ROOT_ID,
  isCanvas: false,
  displayName: 'ProjectBanner',
  linkedNodes: {},
});

const titleNode = (): SerializedNode => ({
  type: { resolvedName: 'ProjectTitle' },
  nodes: [],
  props: {},
  custom: {
    title: widgetMessages.titleWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  hidden: false,
  parent: ROOT_ID,
  isCanvas: false,
  displayName: 'ProjectTitle',
  linkedNodes: {},
});

const bodyNode = (childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'ProjectPageBody' },
  nodes: childIds,
  props: {},
  custom: { region: true },
  hidden: false,
  parent: ROOT_ID,
  isCanvas: true,
  displayName: 'ProjectPageBody',
  linkedNodes: {},
});

// The project description: pinned in place, but its content is freely editable
// (both here and via the legacy description editor, which edits this subtree).
const descriptionSectionNode = (childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'ProjectDescriptionSection' },
  nodes: childIds,
  props: {},
  custom: {
    title: widgetMessages.descriptionSectionTitle,
    locked: true,
  },
  hidden: false,
  parent: BODY_NODE_ID,
  isCanvas: true,
  displayName: 'ProjectDescriptionSection',
  linkedNodes: {},
});

const phasesNode = (parentId: string): SerializedNode => ({
  type: { resolvedName: 'PhasesWidget' },
  nodes: [],
  props: {},
  custom: {
    title: widgetMessages.phasesWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'PhasesWidget',
  linkedNodes: {},
});

const eventsNode = (parentId: string): SerializedNode => ({
  type: { resolvedName: 'EventsWidget' },
  nodes: [],
  props: {},
  custom: {
    title: widgetMessages.eventsWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'EventsWidget',
  linkedNodes: {},
});

const rootNode = (childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'ProjectPageRoot' },
  nodes: childIds,
  props: {},
  custom: { region: true },
  hidden: false,
  parent: null,
  isCanvas: true,
  displayName: 'ProjectPageRoot',
  linkedNodes: {},
});

// A fresh project page: the locked header above the fixed body sections, with an
// empty description. Mirrors the legacy public project page section for section.
export const defaultProjectPageLayout = (): SerializedNodes => ({
  [ROOT_ID]: rootNode([BANNER_NODE_ID, TITLE_NODE_ID, BODY_NODE_ID]),
  [BANNER_NODE_ID]: bannerNode(),
  [TITLE_NODE_ID]: titleNode(),
  [BODY_NODE_ID]: bodyNode([
    DESCRIPTION_NODE_ID,
    PHASES_NODE_ID,
    EVENTS_NODE_ID,
  ]),
  [DESCRIPTION_NODE_ID]: descriptionSectionNode([]),
  [PHASES_NODE_ID]: phasesNode(BODY_NODE_ID),
  [EVENTS_NODE_ID]: eventsNode(BODY_NODE_ID),
});

const resolvedNameOf = (node: SerializedNode) =>
  typeof node.type === 'object' ? node.type.resolvedName : undefined;

export const findNodeIdByName = (nodes: SerializedNodes, name: string) =>
  Object.keys(nodes).find((id) => resolvedNameOf(nodes[id]) === name);

// Canonical `custom` for the fixed nodes, re-applied on load so titles and lock
// flags stay current even for layouts saved with older values.
const CANONICAL_CUSTOM: Record<string, Record<string, unknown>> = {
  ProjectBanner: {
    title: widgetMessages.bannerWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  ProjectTitle: {
    title: widgetMessages.titleWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  ProjectDescriptionSection: {
    title: widgetMessages.descriptionSectionTitle,
    locked: true,
  },
  PhasesWidget: {
    title: widgetMessages.phasesWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  EventsWidget: {
    title: widgetMessages.eventsWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

// Widgets of the description-builder resolver that are absent from the project
// page resolver, stripped so craft.js doesn't crash deserializing an unknown
// component. Keep in sync with UNSUPPORTED_WIDGETS in
// ContentBuilder::ProjectPageLayoutService.
const REMOVED_WIDGETS = [
  'FolderFiles',
  'FolderTitle',
  'Published',
  'Selection',
  'Spotlight',
];

const collectRemovedIds = (nodes: SerializedNodes) => {
  const removed = new Set<string>();
  const queue = Object.keys(nodes).filter((id) =>
    REMOVED_WIDGETS.includes(resolvedNameOf(nodes[id]) ?? '')
  );

  while (queue.length > 0) {
    const id = queue.shift() as string;
    const node = nodes[id] as SerializedNode | undefined;
    if (!node || removed.has(id)) continue;

    removed.add(id);
    queue.push(...node.nodes, ...Object.values(node.linkedNodes));
  }

  return removed;
};

// Normalises a stored layout into the frozen transition structure (see the
// diagram above): injects missing fixed nodes, enforces the canonical order and
// re-stamps the lock flags from code, so a code change (e.g. the unlock at
// launch) applies to every stored layout without a data migration.
// Idempotent — canonical layouts pass through unchanged.
export const normalizeProjectPageLayout = (
  nodes?: SerializedNodes
): SerializedNodes => {
  if (!nodes || !(ROOT_ID in nodes)) {
    return defaultProjectPageLayout();
  }

  const removedIds = collectRemovedIds(nodes);

  // Re-stamp canonical custom + drop removed-widget references.
  const next: SerializedNodes = {};
  Object.entries(nodes).forEach(([id, node]) => {
    if (removedIds.has(id)) return;
    const name = resolvedNameOf(node) ?? '';
    const canonical = name in CANONICAL_CUSTOM ? CANONICAL_CUSTOM[name] : null;
    const cleaned =
      removedIds.size > 0
        ? {
            ...node,
            nodes: node.nodes.filter((n) => !removedIds.has(n)),
            linkedNodes: Object.fromEntries(
              Object.entries(node.linkedNodes).filter(
                ([, n]) => !removedIds.has(n)
              )
            ),
          }
        : node;
    next[id] = canonical
      ? { ...cleaned, custom: { ...cleaned.custom, ...canonical } }
      : cleaned;
  });

  const ensureNode = (
    name: string,
    fallbackId: string,
    build: () => SerializedNode
  ) => {
    const existingId = findNodeIdByName(next, name);
    if (existingId) return existingId;
    next[fallbackId] = build();
    return fallbackId;
  };

  const bannerId = ensureNode('ProjectBanner', BANNER_NODE_ID, bannerNode);
  const titleId = ensureNode('ProjectTitle', TITLE_NODE_ID, titleNode);
  const bodyId = ensureNode('ProjectPageBody', BODY_NODE_ID, () =>
    bodyNode([])
  );
  const descriptionId = ensureNode(
    'ProjectDescriptionSection',
    DESCRIPTION_NODE_ID,
    () => descriptionSectionNode([])
  );
  const phasesId = ensureNode('PhasesWidget', PHASES_NODE_ID, () =>
    phasesNode(bodyId)
  );
  const eventsId = ensureNode('EventsWidget', EVENTS_NODE_ID, () =>
    eventsNode(bodyId)
  );

  // Pin every fixed node under its designated parent, in the frozen order.
  next[bannerId] = { ...next[bannerId], parent: ROOT_ID };
  next[titleId] = { ...next[titleId], parent: ROOT_ID };
  next[bodyId] = {
    ...next[bodyId],
    parent: ROOT_ID,
    nodes: [descriptionId, phasesId, eventsId],
  };
  next[descriptionId] = { ...next[descriptionId], parent: bodyId };
  next[phasesId] = { ...next[phasesId], parent: bodyId };
  next[eventsId] = { ...next[eventsId], parent: bodyId };

  const root = next[ROOT_ID];
  next[ROOT_ID] = {
    ...root,
    type: { resolvedName: 'ProjectPageRoot' },
    isCanvas: true,
    displayName: 'ProjectPageRoot',
    custom: { ...root.custom, region: true },
    nodes: [bannerId, titleId, bodyId],
  };

  return next;
};
