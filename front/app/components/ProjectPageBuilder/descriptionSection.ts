import { SerializedNodes, SerializedNode } from '@craftjs/core';

import { findNodeIdByName, resolvedNameOf } from './defaultLayout';

const ROOT_ID = 'ROOT';

const BODY_NAME = 'ProjectPageBody';

// Widgets that render live project data rather than description content. The
// legacy description projection is everything in the page body except these.
const PROJECT_WIDGETS = ['PhasesWidget', 'EventsWidget', 'ExtraSurveysWidget'];

const editorRootNode = (childIds: string[]): SerializedNode => ({
  type: 'div',
  isCanvas: true,
  props: { id: 'e2e-content-builder-frame' },
  displayName: 'div',
  custom: {},
  hidden: false,
  parent: null,
  nodes: childIds,
  linkedNodes: {},
});

const collectSubtreeIds = (nodes: SerializedNodes, startIds: string[]) => {
  const collected = new Set<string>();
  const queue = [...startIds];

  while (queue.length > 0) {
    const id = queue.shift() as string;
    const node = nodes[id] as SerializedNode | undefined;
    if (!node || collected.has(id)) continue;

    collected.add(id);
    queue.push(...node.nodes, ...Object.values(node.linkedNodes));
  }

  return collected;
};

const isProjectWidget = (nodes: SerializedNodes, id: string) => {
  const node = nodes[id] as SerializedNode | undefined;
  return !!node && PROJECT_WIDGETS.includes(resolvedNameOf(node) ?? '');
};

export const extractDescriptionEditorData = (
  projectPageNodes: SerializedNodes
): SerializedNodes => {
  const bodyId = findNodeIdByName(projectPageNodes, BODY_NAME);
  const childIds = (bodyId ? projectPageNodes[bodyId].nodes : []).filter(
    (id) => !isProjectWidget(projectPageNodes, id)
  );
  const subtreeIds = collectSubtreeIds(projectPageNodes, childIds);

  // Project widgets nested inside content (e.g. Events in a column) can't be
  // rendered by the legacy editor/page — strip them from the projection.
  const nestedWidgetIds = collectSubtreeIds(
    projectPageNodes,
    [...subtreeIds].filter((id) => isProjectWidget(projectPageNodes, id))
  );

  const editorData: SerializedNodes = {
    [ROOT_ID]: editorRootNode(childIds.filter((id) => subtreeIds.has(id))),
  };
  subtreeIds.forEach((id) => {
    if (nestedWidgetIds.has(id)) return;
    const node = projectPageNodes[id];
    const cleaned =
      nestedWidgetIds.size > 0
        ? {
            ...node,
            nodes: node.nodes.filter((n) => !nestedWidgetIds.has(n)),
            linkedNodes: Object.fromEntries(
              Object.entries(node.linkedNodes).filter(
                ([, n]) => !nestedWidgetIds.has(n)
              )
            ),
          }
        : node;
    editorData[id] =
      cleaned.parent === bodyId ? { ...cleaned, parent: ROOT_ID } : cleaned;
  });

  return editorData;
};

export const spliceDescriptionEditorData = (
  projectPageNodes: SerializedNodes,
  editedNodes: SerializedNodes
): SerializedNodes => {
  const bodyId = findNodeIdByName(projectPageNodes, BODY_NAME);
  if (!bodyId || !(ROOT_ID in editedNodes)) return projectPageNodes;

  const bodyChildren = projectPageNodes[bodyId].nodes;
  const previousChildIds = bodyChildren.filter(
    (id) => !isProjectWidget(projectPageNodes, id)
  );
  const previousSubtreeIds = collectSubtreeIds(
    projectPageNodes,
    previousChildIds
  );

  const next: SerializedNodes = {};
  Object.entries(projectPageNodes).forEach(([id, node]) => {
    if (!previousSubtreeIds.has(id)) next[id] = node;
  });

  const editedChildIds = editedNodes[ROOT_ID].nodes;
  Object.entries(editedNodes).forEach(([id, node]) => {
    if (id === ROOT_ID) return;
    next[id] = node.parent === ROOT_ID ? { ...node, parent: bodyId } : node;
  });

  // The edited content replaces the previous description content in place:
  // at the position of the first content element, or before everything else
  // (the legacy page's description spot) when there was none.
  const newBodyChildren: string[] = [];
  let inserted = false;
  for (const id of bodyChildren) {
    if (isProjectWidget(projectPageNodes, id)) {
      newBodyChildren.push(id);
    } else if (!inserted) {
      newBodyChildren.push(...editedChildIds);
      inserted = true;
    }
  }
  if (!inserted) newBodyChildren.unshift(...editedChildIds);
  next[bodyId] = { ...next[bodyId], nodes: newBodyChildren };

  return next;
};
