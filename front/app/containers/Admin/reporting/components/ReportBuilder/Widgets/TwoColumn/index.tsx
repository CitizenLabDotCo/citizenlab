import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';

// craft
import { TwoColumnSettings } from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import { Element } from '@craftjs/core';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// i18n
import messages from 'components/admin/ContentBuilder/Widgets/TwoColumn/messages';

type TwoColumnProps = {
  columnLayout: string;
  children?: React.ReactNode;
};

const StyledBox = styled(Box)`
  min-height: 40px;
  width: 100%;
  gap: 24px;
  display: grid;

  grid-template-columns: ${(props: TwoColumnProps) =>
    props.columnLayout === '1-1'
      ? '1fr 1fr'
      : props.columnLayout === '2-1'
      ? '2fr 1fr'
      : '1fr 2fr'};
`;

export const TwoColumn = ({ columnLayout, children }: TwoColumnProps) => {
  return (
    <StyledBox id="e2e-two-column" columnLayout={columnLayout}>
      {children || (
        <>
          <Element id={'left'} is={Container} canvas />
          <Element id={'right'} is={Container} canvas />
        </>
      )}
    </StyledBox>
  );
};

TwoColumn.craft = {
  props: {
    columnLayout: '',
  },
  related: {
    settings: TwoColumnSettings,
  },
  custom: {
    title: messages.twoColumn,
    hasChildren: true,
  },
};

export default TwoColumn;
