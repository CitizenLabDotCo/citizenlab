import { useNode, useEditor } from '@craftjs/core';

export default function useNarrow() {
  const { id } = useNode();
  const {
    parentId,
    query: { node },
  } = useEditor((_, query) => ({
    parentId: query.node(id).ancestors()[0],
  }));

  const grandParentNode = node(node(parentId).ancestors()[0]).get();
  const isInNarrowLayout = !!(grandParentNode?.data.name === 'TwoColumn');

  return isInNarrowLayout;
}
