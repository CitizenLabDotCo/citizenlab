import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { DEFAULT_PADDING } from './constants';
import { ROOT_NODE, useEditor } from '@craftjs/core';

const useCraftComponentDefaultPadding = (parent: string) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { query } = useEditor();
  const parentNode = query.node(parent);

  return isSmallerThanTablet &&
    (parent === ROOT_NODE || parentNode.get().data.displayName === 'Box')
    ? DEFAULT_PADDING
    : '0px';
};

export default useCraftComponentDefaultPadding;
