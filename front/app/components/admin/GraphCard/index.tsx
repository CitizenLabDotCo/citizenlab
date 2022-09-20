import React from 'react';

// components
import {
  GraphCard as GraphCardContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu, {
  ReportExportMenuProps,
} from 'components/admin/ReportExportMenu';

interface Props {
  title?: string | React.ReactNode;
  exportMenu?: ReportExportMenuProps;
  children?: React.ReactNode;
}

const GraphCard = ({ title, exportMenu, children }: Props) => (
  <GraphCardContainer className="fullWidth dynamicHeight">
    <GraphCardInner>
      <GraphCardHeader>
        <GraphCardTitle>{title}</GraphCardTitle>
        {exportMenu && <ReportExportMenu {...exportMenu} />}
      </GraphCardHeader>
      {children}
    </GraphCardInner>
  </GraphCardContainer>
);

export default GraphCard;
