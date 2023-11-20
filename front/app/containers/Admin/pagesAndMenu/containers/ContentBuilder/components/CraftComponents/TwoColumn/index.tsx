import React from 'react';

// craft
import { Element } from '@craftjs/core';
import Container from '../Container';
import {
  TwoColumnWrapper,
  twoColumnCraftConfig,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import usePx from 'components/admin/ContentBuilder/Widgets/usePx';

// typings
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';

type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
};

export const TwoColumn = ({ columnLayout, children }: TwoColumnProps) => {
  const px = usePx();

  return (
    <TwoColumnWrapper
      id="e2e-two-column"
      columnLayout={columnLayout}
      maxWidth="1150px"
      margin="0 auto"
      px={px}
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
