import { SerializedNodes, SerializedNode } from '@craftjs/core';

import aboutBoxMessages from 'components/admin/ContentBuilder/Widgets/AboutBox/messages';
import textMultilocMessages from 'components/admin/ContentBuilder/Widgets/TextMultiloc/messages';
import twoColumnMessages from 'components/admin/ContentBuilder/Widgets/TwoColumn/messages';

import widgetMessages from './Widgets/messages';

export const BANNER_NODE_ID = 'PROJECT_PAGE_BANNER';
export const TITLE_NODE_ID = 'PROJECT_PAGE_TITLE';
export const BODY_NODE_ID = 'PROJECT_PAGE_BODY';
export const PHASES_NODE_ID = 'PROJECT_PAGE_PHASES';
export const EVENTS_NODE_ID = 'PROJECT_PAGE_EVENTS';

const INTRO_COLUMNS_NODE_ID = 'PROJECT_PAGE_INTRO_COLUMNS';
const INTRO_LEFT_NODE_ID = 'PROJECT_PAGE_INTRO_LEFT';
const INTRO_TEXT_NODE_ID = 'PROJECT_PAGE_INTRO_TEXT';
const INTRO_RIGHT_NODE_ID = 'PROJECT_PAGE_INTRO_RIGHT';
const PARTICIPATION_BOX_NODE_ID = 'PROJECT_PAGE_PARTICIPATION_BOX';
const DETAILS_COLUMNS_NODE_ID = 'PROJECT_PAGE_DETAILS_COLUMNS';
const DETAILS_LEFT_NODE_ID = 'PROJECT_PAGE_DETAILS_LEFT';
const DETAILS_TEXT_NODE_ID = 'PROJECT_PAGE_DETAILS_TEXT';
const DETAILS_RIGHT_NODE_ID = 'PROJECT_PAGE_DETAILS_RIGHT';

export const SEEDED_CONTENT_NODE_IDS = [
  INTRO_COLUMNS_NODE_ID,
  INTRO_LEFT_NODE_ID,
  INTRO_TEXT_NODE_ID,
  INTRO_RIGHT_NODE_ID,
  PARTICIPATION_BOX_NODE_ID,
  DETAILS_COLUMNS_NODE_ID,
  DETAILS_LEFT_NODE_ID,
  DETAILS_TEXT_NODE_ID,
  DETAILS_RIGHT_NODE_ID,
];

const ROOT_ID = 'ROOT';

// The transitional locked container that used to hold the description content.
// Stored layouts that predate the unlocked builder still have one; it is
// unwrapped on every load until the layout's next save persists the flat shape.
const DESCRIPTION_SECTION_NAME = 'ProjectDescriptionSection';

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

const phasesNode = (parentId: string): SerializedNode => ({
  type: { resolvedName: 'PhasesWidget' },
  nodes: [],
  props: {},
  custom: {
    title: widgetMessages.phasesWidgetTitle,
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
    noPointerEvents: true,
  },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'EventsWidget',
  linkedNodes: {},
});

// Craft.js serializes TwoColumn's columns as linked nodes keyed left/right
// (not as canvas children), and the column containers carry no props.
const columnsNode = (
  parentId: string,
  linked: { left: string; right: string }
): SerializedNode => ({
  type: { resolvedName: 'TwoColumn' },
  nodes: [],
  props: { columnLayout: '2-1' },
  custom: {
    title: twoColumnMessages.twoColumn,
    hasChildren: true,
  },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'TwoColumn',
  linkedNodes: linked,
});

const columnNode = (parentId: string, childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'Container' },
  nodes: childIds,
  props: {},
  custom: {},
  hidden: false,
  parent: parentId,
  isCanvas: true,
  displayName: 'Container',
  linkedNodes: {},
});

const textNode = (parentId: string): SerializedNode => ({
  type: { resolvedName: 'TextMultiloc' },
  nodes: [],
  props: { text: {} },
  custom: { title: textMultilocMessages.textMultiloc },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'TextMultiloc',
  linkedNodes: {},
});

const participationBoxNode = (parentId: string): SerializedNode => ({
  type: { resolvedName: 'AboutBox' },
  nodes: [],
  props: {},
  custom: {
    title: aboutBoxMessages.participationBox,
    noPointerEvents: true,
  },
  hidden: false,
  parent: parentId,
  isCanvas: false,
  displayName: 'AboutBox',
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
    INTRO_COLUMNS_NODE_ID,
    DETAILS_COLUMNS_NODE_ID,
    PHASES_NODE_ID,
    EVENTS_NODE_ID,
  ]),
  [INTRO_COLUMNS_NODE_ID]: columnsNode(BODY_NODE_ID, {
    left: INTRO_LEFT_NODE_ID,
    right: INTRO_RIGHT_NODE_ID,
  }),
  [INTRO_LEFT_NODE_ID]: columnNode(INTRO_COLUMNS_NODE_ID, [INTRO_TEXT_NODE_ID]),
  [INTRO_TEXT_NODE_ID]: textNode(INTRO_LEFT_NODE_ID),
  [INTRO_RIGHT_NODE_ID]: columnNode(INTRO_COLUMNS_NODE_ID, [
    PARTICIPATION_BOX_NODE_ID,
  ]),
  [PARTICIPATION_BOX_NODE_ID]: participationBoxNode(INTRO_RIGHT_NODE_ID),
  [DETAILS_COLUMNS_NODE_ID]: columnsNode(BODY_NODE_ID, {
    left: DETAILS_LEFT_NODE_ID,
    right: DETAILS_RIGHT_NODE_ID,
  }),
  [DETAILS_LEFT_NODE_ID]: columnNode(DETAILS_COLUMNS_NODE_ID, [
    DETAILS_TEXT_NODE_ID,
  ]),
  [DETAILS_TEXT_NODE_ID]: textNode(DETAILS_LEFT_NODE_ID),
  [DETAILS_RIGHT_NODE_ID]: columnNode(DETAILS_COLUMNS_NODE_ID, []),
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
  PhasesWidget: {
    title: widgetMessages.phasesWidgetTitle,
    noPointerEvents: true,
  },
  EventsWidget: {
    title: widgetMessages.eventsWidgetTitle,
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

  for (const id of queue) {
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
    next[id] = canonical ? { ...cleaned, custom: { ...canonical } } : cleaned;
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

  const sectionId = findNodeIdByName(next, DESCRIPTION_SECTION_NAME);
  if (sectionId) {
    const sectionChildren = next[sectionId].nodes;
    const bodyChildren = next[bodyId].nodes;
    const sectionIndex = bodyChildren.indexOf(sectionId);
    const unwrapped =
      sectionIndex === -1
        ? [...sectionChildren, ...bodyChildren]
        : [
            ...bodyChildren.slice(0, sectionIndex),
            ...sectionChildren,
            ...bodyChildren.slice(sectionIndex + 1),
          ];
    sectionChildren.forEach((childId) => {
      next[childId] = { ...next[childId], parent: bodyId };
    });
    delete next[sectionId];
    next[bodyId] = { ...next[bodyId], nodes: unwrapped };
  }

  next[bannerId] = { ...next[bannerId], parent: ROOT_ID };
  next[titleId] = { ...next[titleId], parent: ROOT_ID };
  next[bodyId] = { ...next[bodyId], parent: ROOT_ID };
  next[bodyId].nodes.forEach((childId) => {
    const child = next[childId] as SerializedNode | undefined;
    if (child && child.parent !== bodyId) {
      next[childId] = { ...child, parent: bodyId };
    }
  });

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
