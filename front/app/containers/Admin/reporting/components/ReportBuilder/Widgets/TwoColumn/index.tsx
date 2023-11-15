import React from 'react';

// components

// styles
import styled from 'styled-components';

// craft
import {
  TwoColumnSettings,
  TwoColumnWrapper,
} from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import { Element } from '@craftjs/core';
import Container from 'components/admin/ContentBuilder/Widgets/Container';

// i18n
import messages from 'components/admin/ContentBuilder/Widgets/TwoColumn/messages';

// typings
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';

type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
};

const StyledBox = styled(TwoColumnWrapper)`
  grid-gap: 8px;
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
