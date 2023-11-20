import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { ROOT_NODE, useNode } from '@craftjs/core';
import { DEFAULT_PADDING } from '../constants';

const usePx = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return isSmallerThanTablet && parent === ROOT_NODE ? DEFAULT_PADDING : '0px';
};

export default usePx;
