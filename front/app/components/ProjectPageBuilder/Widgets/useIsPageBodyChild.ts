import { useEditor, useNode } from '@craftjs/core';

// Whether the widget sits directly in the page body, as opposed to nested
// inside a column or container — full-bleed backgrounds are only safe there.
const useIsPageBodyChild = () => {
  const { parentId } = useNode((node) => ({ parentId: node.data.parent }));
  const { isPageBodyChild } = useEditor((state) => ({
    isPageBodyChild: parentId
      ? state.nodes[parentId]?.data.name === 'ProjectPageBody'
      : false,
  }));
  return isPageBodyChild;
};

export default useIsPageBodyChild;
