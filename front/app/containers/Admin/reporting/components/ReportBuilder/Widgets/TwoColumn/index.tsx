import React from 'react';

// styles
import styled from 'styled-components';

// craft
import { twoColumnCraftConfig } from 'components/admin/ContentBuilder/Widgets/TwoColumn';
import { Element } from '@craftjs/core';
import Container from 'components/admin/ContentBuilder/Widgets/Container';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// i18n

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

const StyledBox = styled.div<{
  columnLayout: ColumnLayout;
  layout: Layout;
}>`
  min-height: 40px;
  width: 100%;

  ${({ layout, columnLayout }) =>
    layout === 'narrow'
      ? ''
      : `
    display: grid;
    grid-gap: 8px;
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

TwoColumn.craft = twoColumnCraftConfig;

export default TwoColumn;
