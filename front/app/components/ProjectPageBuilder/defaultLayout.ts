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
//          ├─ Timeline        (locked)
//          ├─ Phase content   (locked)
//          └─ Events          (locked)
//
// The locks live in code — `ensureLockedHeaderNodes` re-stamps them on every
// load — so unlocking at launch is a code change that instantly applies to
// every stored layout, with no data migration.
export const BANNER_NODE_ID = 'PROJECT_PAGE_BANNER';
export const TITLE_NODE_ID = 'PROJECT_PAGE_TITLE';
export const BODY_NODE_ID = 'PROJECT_PAGE_BODY';
export const DESCRIPTION_NODE_ID = 'PROJECT_PAGE_DESCRIPTION';
export const INPUT_FEED_NODE_ID = 'PROJECT_PAGE_INPUT_FEED';
export const TIMELINE_NODE_ID = 'PROJECT_PAGE_TIMELINE';
export const EVENTS_NODE_ID = 'PROJECT_PAGE_EVENTS';

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

// The project description: pinned in place, but its content is freely editable
// (both here and via the legacy description editor, which edits this subtree).
const descriptionSectionNode = (childIds: string[]): SerializedNode =>
  ({
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
  } as unknown as SerializedNode);

const inputFeedNode = (parentId: string): SerializedNode =>
  ({
    type: { resolvedName: 'InputFeed' },
    nodes: [],
    props: {},
    custom: {
      title: widgetMessages.inputFeedWidgetTitle2,
      locked: true,
      noPointerEvents: true,
    },
    hidden: false,
    parent: parentId,
    isCanvas: false,
    displayName: 'InputFeed',
    linkedNodes: {},
  } as unknown as SerializedNode);

const timelineNode = (parentId: string): SerializedNode =>
  ({
    type: { resolvedName: 'TimelineWidget' },
    nodes: [],
    props: {},
    custom: {
      title: widgetMessages.timelineWidgetTitle,
      locked: true,
      noPointerEvents: true,
    },
    hidden: false,
    parent: parentId,
    isCanvas: false,
    displayName: 'TimelineWidget',
    linkedNodes: {},
  } as unknown as SerializedNode);

const eventsNode = (parentId: string): SerializedNode =>
  ({
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

// A fresh project page: the locked header above the fixed body sections, with an
// empty description. Mirrors the legacy public project page section for section.
export const defaultProjectPageLayout = (): SerializedNodes => ({
  [ROOT_ID]: rootNode([BANNER_NODE_ID, TITLE_NODE_ID, BODY_NODE_ID]),
  [BANNER_NODE_ID]: bannerNode(),
  [TITLE_NODE_ID]: titleNode(),
  [BODY_NODE_ID]: bodyNode([
    DESCRIPTION_NODE_ID,
    TIMELINE_NODE_ID,
    INPUT_FEED_NODE_ID,
    EVENTS_NODE_ID,
  ]),
  [DESCRIPTION_NODE_ID]: descriptionSectionNode([]),
  [TIMELINE_NODE_ID]: timelineNode(BODY_NODE_ID),
  [INPUT_FEED_NODE_ID]: inputFeedNode(BODY_NODE_ID),
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
  TimelineWidget: {
    title: widgetMessages.timelineWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
  InputFeed: {
    title: widgetMessages.inputFeedWidgetTitle2,
    locked: true,
    noPointerEvents: true,
  },
  EventsWidget: {
    title: widgetMessages.eventsWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

// Widgets absent from the project page resolver: ones removed over time, plus the
// DescriptionBuilder-only widgets that exist in project_description layouts. Their
// nodes are stripped so craft.js doesn't crash deserializing an unknown component.
// Keep in sync with UNSUPPORTED_WIDGETS in the project_page migration rake task.
const REMOVED_WIDGETS = [
  'ExtraSurveysWidget',
  'FolderFiles',
  'FolderTitle',
  'Published',
  'Selection',
  'Spotlight',
];

// Normalises a stored layout into the frozen transition structure: locked
// Banner + Title on top, then a body fixed to description → timeline → phase
// content → events. Free-form content found anywhere in the body is adopted
// into the description section, so it keeps rendering on both the new and the
// legacy page. Idempotent — canonical layouts pass through unchanged.
export const ensureLockedHeaderNodes = (
  nodes?: SerializedNodes
): SerializedNodes => {
  if (!nodes || !(ROOT_ID in nodes)) {
    return defaultProjectPageLayout();
  }

  const removedIds = Object.keys(nodes).filter((id) =>
    REMOVED_WIDGETS.includes(resolvedNameOf(nodes[id]) ?? '')
  );

  // Re-stamp canonical custom + drop removed-widget references.
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

  const root = next[ROOT_ID];

  // Ensure the body exists, moving any top-level user content into it
  // (migration from the old flat structure).
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

  const descriptionId = ensureNode(
    'ProjectDescriptionSection',
    DESCRIPTION_NODE_ID,
    () => descriptionSectionNode([])
  );
  const timelineId = ensureNode('TimelineWidget', TIMELINE_NODE_ID, () =>
    timelineNode(bodyId)
  );
  const inputFeedId = ensureNode('InputFeed', INPUT_FEED_NODE_ID, () =>
    inputFeedNode(bodyId)
  );
  const eventsId = ensureNode('EventsWidget', EVENTS_NODE_ID, () =>
    eventsNode(bodyId)
  );

  // Adopt free-form body content into the description section (layouts saved
  // before the section existed), preserving its order.
  const fixedBodyIds = [descriptionId, timelineId, inputFeedId, eventsId];
  const adopted = next[bodyId].nodes.filter((id) => !fixedBodyIds.includes(id));
  adopted.forEach((id) => {
    next[id] = { ...next[id], parent: descriptionId };
  });
  if (adopted.length > 0) {
    next[descriptionId] = {
      ...next[descriptionId],
      nodes: [...next[descriptionId].nodes, ...adopted],
    };
  }

  // Pin every fixed node under its designated parent, and drop stale references
  // to them from anywhere else (e.g. a timeline that was nested in a column).
  const pinnedParents: Record<string, string> = {
    [bannerId]: ROOT_ID,
    [titleId]: ROOT_ID,
    [bodyId]: ROOT_ID,
    [descriptionId]: bodyId,
    [timelineId]: bodyId,
    [inputFeedId]: bodyId,
    [eventsId]: bodyId,
  };
  Object.entries(next).forEach(([id, node]) => {
    if (!Array.isArray(node.nodes)) return;
    const filtered = node.nodes.filter(
      (childId) => !(childId in pinnedParents) || pinnedParents[childId] === id
    );
    if (filtered.length !== node.nodes.length) {
      next[id] = { ...node, nodes: filtered };
    }
  });
  Object.entries(pinnedParents).forEach(([id, parent]) => {
    next[id] = { ...next[id], parent };
  });

  next[bodyId] = { ...next[bodyId], nodes: fixedBodyIds };
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
