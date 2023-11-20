import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { ROOT_NODE, useNode } from '@craftjs/core';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const usePx = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parentId } = useNode((node) => ({
    parentId: node.data.parent,
  }));

  return isSmallerThanTablet && parentId === ROOT_NODE
    ? DEFAULT_PADDING
    : '0px';
};

export default usePx;
