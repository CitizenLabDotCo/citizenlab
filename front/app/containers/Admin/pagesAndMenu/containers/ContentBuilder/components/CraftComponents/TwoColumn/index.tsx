import React from 'react';

// components
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// craft
import { useNode, Element, ROOT_NODE } from '@craftjs/core';
import Container from '../Container';
import {
  TwoColumnWrapper,
  twoColumnCraftConfig,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';

// typings
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';

type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
};

export const TwoColumn = ({ columnLayout, children }: TwoColumnProps) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { parent } = useNode((node) => ({
    parent: node.data.parent,
  }));

  return (
    <TwoColumnWrapper
      id="e2e-two-column"
      columnLayout={columnLayout}
      maxWidth="1150px"
      margin="0 auto"
      px={isSmallerThanTablet && parent === ROOT_NODE ? '20px' : '0px'}
    >
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </TwoColumnWrapper>
  );
};

TwoColumn.craft = twoColumnCraftConfig;

export default TwoColumn;
