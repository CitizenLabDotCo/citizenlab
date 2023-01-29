import { useNode, useEditor } from '@craftjs/core';

export default function useNarrow() {
  const { id } = useNode();
  const {
    parentId,
    query: { node },
  } = useEditor((_, query) => ({
    parentId: id ? query.node(id)?.ancestors()[0] : undefined,
  }));

  if (!parentId) return false;
  const grandParentId = node(parentId)?.ancestors()[0];
  if (!grandParentId) return false;

  const grandParentNode = node(grandParentId)?.get();
  const isInNarrowLayout = !!(grandParentNode?.data.name === 'TwoColumn');

  return isInNarrowLayout;
}
