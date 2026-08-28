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

export const findNodeIdByName = (nodes: SerializedNodes, name: string) =>
  Object.keys(nodes).find((id) => resolvedNameOf(nodes[id]) === name);

// A node off the wire may have no children array at all, whatever the type says.
const childIdsOf = (node: SerializedNode): string[] =>
  Array.isArray(node.nodes) ? node.nodes : [];

// Every stored layout carries the scaffold, so an unused builder still yields a non-empty
// graph. Content means the body region holds something — or ROOT, on a graph with no body.
export const layoutHasContent = (nodes?: SerializedNodes): boolean => {
  if (!nodes) return false;

  const bodyId = findNodeIdByName(nodes, 'CustomPageBody');
  // Widened: an index lookup is typed as always present, but either node may be missing.
  const container = (bodyId ? nodes[bodyId] : nodes[ROOT_ID]) as
    | SerializedNode
    | undefined;

  return !!container && childIdsOf(container).length > 0;
};

// Guarantees the scaffold the editor relies on: a CustomPageRoot holding one CustomPageBody,
// with ordinary nodes under the body and the pinned header slots left alongside it. A layout
// saved against an older scaffold is repaired rather than discarded.
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
    // No body yet: adopt what ROOT was holding so no content is lost.
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
  // Pinned slots stay on ROOT in their stored order. When the body was just created they
  // were adopted into it instead, so ROOT keeps only the body.
  const storedRootIds = existingBodyId
    ? childIdsOf(root).filter((id) => id in next)
    : [];
  const rootIds = storedRootIds.includes(bodyId)
    ? storedRootIds
    : [...storedRootIds, bodyId];

  next[ROOT_ID] = {
    ...root,
    type: { resolvedName: 'CustomPageRoot' },
    isCanvas: true,
    displayName: 'CustomPageRoot',
    custom: { ...root.custom, region: true },
    nodes: rootIds,
  };

  return next;
};
