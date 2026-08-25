import { SerializedNodes, SerializedNode } from '@craftjs/core';

export const BODY_NODE_ID = 'CUSTOM_PAGE_BODY';

const ROOT_ID = 'ROOT';

const bodyNode = (childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'CustomPageBody' },
  nodes: childIds,
  props: {},
  custom: { region: true },
  hidden: false,
  parent: ROOT_ID,
  isCanvas: true,
  displayName: 'CustomPageBody',
  linkedNodes: {},
});

const rootNode = (childIds: string[]): SerializedNode => ({
  type: { resolvedName: 'CustomPageRoot' },
  nodes: childIds,
  props: {},
  custom: { region: true },
  hidden: false,
  parent: null,
  isCanvas: true,
  displayName: 'CustomPageRoot',
  linkedNodes: {},
});

export const defaultCustomPageLayout = (): SerializedNodes => ({
  [ROOT_ID]: rootNode([BODY_NODE_ID]),
  [BODY_NODE_ID]: bodyNode([]),
});

const resolvedNameOf = (node: SerializedNode) =>
  typeof node.type === 'object' ? node.type.resolvedName : undefined;

const findNodeIdByName = (nodes: SerializedNodes, name: string) =>
  Object.keys(nodes).find((id) => resolvedNameOf(nodes[id]) === name);

// Stored graphs are typed optimistically but come off the wire, where a node may be missing
// its children array entirely. Normalising has to survive that rather than throw.
const childIdsOf = (node: SerializedNode): string[] =>
  Array.isArray(node.nodes) ? node.nodes : [];

// A stored layout always carries the scaffold, so "is it empty" cannot be asked of the
// graph as a whole: a page whose builder has never been used still has a root and a body.
// Content means the body region holds something — or, on a graph saved before the body
// existed, that ROOT does.
export const layoutHasContent = (nodes?: SerializedNodes): boolean => {
  if (!nodes) return false;

  const bodyId = findNodeIdByName(nodes, 'CustomPageBody');
  // Widened deliberately: an index lookup is typed as always present, but a graph off the
  // wire may carry neither node.
  const container = (bodyId ? nodes[bodyId] : nodes[ROOT_ID]) as
    | SerializedNode
    | undefined;

  return !!container && childIdsOf(container).length > 0;
};

// Guarantees the scaffold the editor relies on: a CustomPageRoot holding exactly one
// CustomPageBody, with every other node hanging off the body. A layout that predates a
// scaffold change, or one saved before the body existed, is repaired rather than discarded.
export const normalizeCustomPageLayout = (
  nodes?: SerializedNodes
): SerializedNodes => {
  if (!nodes || !(ROOT_ID in nodes)) {
    return defaultCustomPageLayout();
  }

  const next: SerializedNodes = { ...nodes };

  const existingBodyId = findNodeIdByName(next, 'CustomPageBody');
  const bodyId = existingBodyId ?? BODY_NODE_ID;
  if (!existingBodyId) {
    // No body yet: adopt whatever ROOT was holding so no content is lost.
    next[bodyId] = bodyNode(childIdsOf(next[ROOT_ID]));
  }

  next[bodyId] = {
    ...next[bodyId],
    parent: ROOT_ID,
    nodes: childIdsOf(next[bodyId]),
  };
  next[bodyId].nodes.forEach((childId) => {
    const child = next[childId] as SerializedNode | undefined;
    if (child && child.parent !== bodyId) {
      next[childId] = { ...child, parent: bodyId };
    }
  });

  const root = next[ROOT_ID];
  next[ROOT_ID] = {
    ...root,
    type: { resolvedName: 'CustomPageRoot' },
    isCanvas: true,
    displayName: 'CustomPageRoot',
    custom: { ...root.custom, region: true },
    nodes: [bodyId],
  };

  return next;
};
