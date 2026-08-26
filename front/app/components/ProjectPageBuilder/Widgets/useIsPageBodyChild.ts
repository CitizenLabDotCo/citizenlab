import { Node, useEditor, useNode } from '@craftjs/core';

// Whether the widget sits directly in the page body, as opposed to nested
// inside a column or container — full-bleed backgrounds are only safe there.
// The body region is named per builder, hence the parameter.
const useIsPageBodyChild = (bodyName = 'ProjectPageBody') => {
  const { parentId } = useNode((node) => ({ parentId: node.data.parent }));
  const { isPageBodyChild } = useEditor((state) => {
    const parent = parentId
      ? (state.nodes[parentId] as Node | undefined)
      : null;
    return { isPageBodyChild: parent?.data.name === bodyName };
  });
  return isPageBodyChild;
};

export default useIsPageBodyChild;
