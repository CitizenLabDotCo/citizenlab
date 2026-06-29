import { SerializedNodes, SerializedNode } from '@craftjs/core';

import widgetMessages from './Widgets/messages';

// The project page layout is split into two canvas regions:
//
//   ROOT (ProjectPageRoot, canMoveIn: false)   ← rejects all drops
//     ├─ Project image (locked)
//     ├─ Title         (locked)
//     └─ ProjectPageBody                        ← the only droppable region
//
// The locked Banner + Title are auto-injected (never added from the toolbox) and
// carry `locked: true` so the builder hides their delete affordance;
// `canDrag: () => false` on the widgets prevents moving them. Because the root
// rejects drops and the body sits below the header, nothing can be dropped above
// the header.
export const BANNER_NODE_ID = 'PROJECT_PAGE_BANNER';
export const TITLE_NODE_ID = 'PROJECT_PAGE_TITLE';
export const BODY_NODE_ID = 'PROJECT_PAGE_BODY';

const ROOT_ID = 'ROOT';

const bannerNode = (): SerializedNode =>
  ({
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
  } as unknown as SerializedNode);

const titleNode = (): SerializedNode =>
  ({
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
  } as unknown as SerializedNode);

const bodyNode = (childIds: string[]): SerializedNode =>
  ({
    type: { resolvedName: 'ProjectPageBody' },
    nodes: childIds,
    props: {},
    custom: { region: true },
    hidden: false,
    parent: ROOT_ID,
    isCanvas: true,
    displayName: 'ProjectPageBody',
    linkedNodes: {},
  } as unknown as SerializedNode);

const rootNode = (childIds: string[]): SerializedNode =>
  ({
    type: { resolvedName: 'ProjectPageRoot' },
    nodes: childIds,
    props: {},
    custom: { region: true },
    hidden: false,
    isCanvas: true,
    displayName: 'ProjectPageRoot',
    linkedNodes: {},
  } as unknown as SerializedNode);

// A fresh project page: the locked header above an empty editable body.
export const defaultProjectPageLayout = (): SerializedNodes => ({
  [ROOT_ID]: rootNode([BANNER_NODE_ID, TITLE_NODE_ID, BODY_NODE_ID]),
  [BANNER_NODE_ID]: bannerNode(),
  [TITLE_NODE_ID]: titleNode(),
  [BODY_NODE_ID]: bodyNode([]),
});

const resolvedNameOf = (node: SerializedNode) =>
  typeof node.type === 'object' ? node.type.resolvedName : undefined;

const findNodeIdByName = (nodes: SerializedNodes, name: string) =>
  Object.keys(nodes).find((id) => resolvedNameOf(nodes[id]) === name);

// Canonical `custom` for the locked header nodes, re-applied on load so the title
// and lock flag stay current even for layouts saved with older values.
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
};

// Widgets that have been removed from the resolver. Their nodes are stripped from
// older layouts so craft.js doesn't crash deserializing an unknown component.
const REMOVED_WIDGETS = ['ExtraSurveysWidget'];

// Normalises a stored layout into the two-region structure: keeps the locked
// Banner + Title at the top, nests all user content in the droppable body, drops
// removed widgets, and re-stamps the header `custom`. Idempotent — already-migrated
// layouts pass through unchanged.
export const ensureLockedHeaderNodes = (
  nodes?: SerializedNodes
): SerializedNodes => {
  if (!nodes || !(ROOT_ID in nodes)) {
    return defaultProjectPageLayout();
  }

  const removedIds = Object.keys(nodes).filter((id) =>
    REMOVED_WIDGETS.includes(resolvedNameOf(nodes[id]) ?? '')
  );

  // Re-stamp header custom + drop removed-widget references.
  const next: SerializedNodes = {};
  Object.entries(nodes).forEach(([id, node]) => {
    if (removedIds.includes(id)) return;
    const name = resolvedNameOf(node) ?? '';
    const canonical = name in CANONICAL_CUSTOM ? CANONICAL_CUSTOM[name] : null;
    const cleaned =
      removedIds.length > 0 && Array.isArray(node.nodes)
        ? { ...node, nodes: node.nodes.filter((n) => !removedIds.includes(n)) }
        : node;
    next[id] = canonical
      ? { ...cleaned, custom: { ...cleaned.custom, ...canonical } }
      : cleaned;
  });

  // Ensure the locked header nodes exist.
  let bannerId = findNodeIdByName(next, 'ProjectBanner');
  if (!bannerId) {
    bannerId = BANNER_NODE_ID;
    next[bannerId] = bannerNode();
  }
  let titleId = findNodeIdByName(next, 'ProjectTitle');
  if (!titleId) {
    titleId = TITLE_NODE_ID;
    next[titleId] = titleNode();
  }

  const root = next[ROOT_ID];

  // Ensure the editable body exists, moving any existing top-level user content
  // into it (migration from the old flat structure).
  let bodyId = findNodeIdByName(next, 'ProjectPageBody');
  if (!bodyId) {
    const newBodyId = BODY_NODE_ID;
    const userIds = root.nodes.filter((n) => n !== bannerId && n !== titleId);
    userIds.forEach((uid) => {
      next[uid] = { ...next[uid], parent: newBodyId };
    });
    next[newBodyId] = bodyNode(userIds);
    bodyId = newBodyId;
  }

  // Pin the header + body directly under the root, in order.
  next[bannerId] = { ...next[bannerId], parent: ROOT_ID };
  next[titleId] = { ...next[titleId], parent: ROOT_ID };
  next[bodyId] = { ...next[bodyId], parent: ROOT_ID };
  next[ROOT_ID] = {
    ...root,
    type: { resolvedName: 'ProjectPageRoot' },
    isCanvas: true,
    displayName: 'ProjectPageRoot',
    custom: { ...root.custom, region: true },
    nodes: [bannerId, titleId, bodyId],
  } as unknown as SerializedNode;

  return next;
};
