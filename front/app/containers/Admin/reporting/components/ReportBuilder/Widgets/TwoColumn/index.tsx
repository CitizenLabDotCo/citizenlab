import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styles
import styled from 'styled-components';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

// craft
import { TwoColumnSettings } from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import { Element } from '@craftjs/core';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// i18n
import messages from 'components/admin/ContentBuilder/Widgets/TwoColumn/messages';

// typings
import { ColumnLayout } from 'components/admin/ContentBuilder/typings';
import { Layout } from 'components/admin/GraphCards/typings';

type TwoColumnProps = {
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
  const px = useReportDefaultPadding();

  return (
    <StyledBox
      id="e2e-two-column"
      columnLayout={columnLayout}
      layout={layout}
      px={px}
    >
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
    hasChildren: true,
  },
};

export const twoColumnTitle = messages.twoColumn;

export default TwoColumn;
