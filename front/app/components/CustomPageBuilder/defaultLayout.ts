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
    next[bodyId] = bodyNode(next[ROOT_ID].nodes);
  }

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
    type: { resolvedName: 'CustomPageRoot' },
    isCanvas: true,
    displayName: 'CustomPageRoot',
    custom: { ...root.custom, region: true },
    nodes: [bodyId],
  };

  return next;
};
