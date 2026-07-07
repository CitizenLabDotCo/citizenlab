import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { ROOT_NODE, useEditor, useNode } from '@craftjs/core';

import { DEFAULT_PADDING } from './constants';

const useCraftComponentDefaultPadding = () => {
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { query } = useEditor();

  if (!parent) return DEFAULT_PADDING;
  const parentNode = query.node(parent);

  // ProjectPageBody is the project page's section container — its sections
  // need the same mobile padding as root-level widgets, so the page's title,
  // description and timeline align.
  const parentName = parentNode.get().data.displayName;

  return isSmallerThanTablet &&
    (parent === ROOT_NODE ||
      parentName === 'Box' ||
      parentName === 'ProjectPageBody')
    ? DEFAULT_PADDING
    : '0px';
};

export default useCraftComponentDefaultPadding;
