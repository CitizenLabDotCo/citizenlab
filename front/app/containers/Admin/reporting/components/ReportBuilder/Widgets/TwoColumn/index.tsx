import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';
import styled from 'styled-components';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import { TwoColumnSettings } from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import messages from 'components/admin/ContentBuilder/Widgets/TwoColumn/messages';
import { Layout } from 'components/admin/GraphCards/typings';

export type TwoColumnProps = {
  columnLayout: ColumnLayout;
  children?: React.ReactNode;
};

const COLUMN_LAYOUTS: Record<ColumnLayout, string> = {
  '1-1': '1fr 1fr',
  '2-1': '2fr 1fr',
  '1-2': '1fr 2fr',
};

const StyledBox = styled(Box)<{
  columnLayout: ColumnLayout;
  layout: Layout;
}>`
  min-height: 40px;
  width: 100%;

  display: grid;
  grid-gap: ${DEFAULT_PADDING};

  ${({ layout, columnLayout }) =>
    layout === 'narrow'
      ? ''
      : `
    grid-template-columns: ${COLUMN_LAYOUTS[columnLayout]};
  `}

  ${({ layout }) =>
    layout === 'narrow'
      ? ''
      : `
    div.report-widget-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
  `}
`;

export const TwoColumn = ({ columnLayout, children }: TwoColumnProps) => {
  const layout = useLayout();

  return (
    <StyledBox id="e2e-two-column" columnLayout={columnLayout} layout={layout}>
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
};

export const twoColumnTitle = messages.twoColumn;

export default TwoColumn;
