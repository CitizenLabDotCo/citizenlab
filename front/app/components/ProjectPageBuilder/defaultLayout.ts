import { SerializedNodes, SerializedNode } from '@craftjs/core';

import widgetMessages from './Widgets/messages';

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

export const normalizeProjectPageLayout = (
  nodes?: SerializedNodes
): SerializedNodes => {
  if (!nodes || !(ROOT_ID in nodes)) {
    return defaultProjectPageLayout();
  }

  const removedIds = collectRemovedIds(nodes);

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
