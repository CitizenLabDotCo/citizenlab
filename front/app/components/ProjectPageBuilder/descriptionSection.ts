import { SerializedNodes, SerializedNode } from '@craftjs/core';

import { findNodeIdByName } from './defaultLayout';

// The description section of a project_page layout is the single source of
// truth for the project description. The legacy description editor and public
// page work on it through these two inverse transforms: `extract` re-roots the
// section's subtree as a standalone editable document, `splice` writes an
// edited document back into the full layout.

const ROOT_ID = 'ROOT';

const DESCRIPTION_SECTION = 'ProjectDescriptionSection';

// The root canvas the description builder expects — identical to the ROOT of a
// legacy project_description layout.
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

// Re-roots the description section's subtree as a standalone craftjs document
// the description builder can edit. Node ids are preserved so splicing back is
// stable. An absent or empty section yields an empty document.
export const extractDescriptionEditorData = (
  projectPageNodes: SerializedNodes
): SerializedNodes => {
  const sectionId = findNodeIdByName(projectPageNodes, DESCRIPTION_SECTION);
  const childIds = sectionId ? projectPageNodes[sectionId].nodes : [];
  const subtreeIds = collectSubtreeIds(projectPageNodes, childIds);

  const editorData: SerializedNodes = {
    [ROOT_ID]: editorRootNode(childIds.filter((id) => subtreeIds.has(id))),
  };
  subtreeIds.forEach((id) => {
    const node = projectPageNodes[id];
    editorData[id] =
      node.parent === sectionId ? { ...node, parent: ROOT_ID } : node;
  });

  return editorData;
};

// Replaces the description section's subtree with the edited document's
// content, leaving every other node of the layout untouched.
export const spliceDescriptionEditorData = (
  projectPageNodes: SerializedNodes,
  editedNodes: SerializedNodes
): SerializedNodes => {
  const sectionId = findNodeIdByName(projectPageNodes, DESCRIPTION_SECTION);
  if (!sectionId || !(ROOT_ID in editedNodes)) return projectPageNodes;

  const previousSubtreeIds = collectSubtreeIds(
    projectPageNodes,
    projectPageNodes[sectionId].nodes
  );

  const next: SerializedNodes = {};
  Object.entries(projectPageNodes).forEach(([id, node]) => {
    if (!previousSubtreeIds.has(id)) next[id] = node;
  });

  const childIds = editedNodes[ROOT_ID].nodes;
  Object.entries(editedNodes).forEach(([id, node]) => {
    if (id === ROOT_ID) return;
    next[id] = node.parent === ROOT_ID ? { ...node, parent: sectionId } : node;
  });
  next[sectionId] = { ...next[sectionId], nodes: childIds };

  return next;
};
