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

  return isSmallerThanTablet &&
    (parent === ROOT_NODE || parentNode.get().data.displayName === 'Box')
    ? DEFAULT_PADDING
    : '0px';
};

export default useCraftComponentDefaultPadding;
