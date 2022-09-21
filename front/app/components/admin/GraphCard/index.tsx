import React from 'react';

// components
import {
  GraphCard as GraphCardContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInnerClean,
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
    <GraphCardInnerClean>
      <GraphCardHeader>
        <GraphCardTitle>{title}</GraphCardTitle>
        {exportMenu && <ReportExportMenu {...exportMenu} />}
      </GraphCardHeader>
      {children}
    </GraphCardInnerClean>
  </GraphCardContainer>
);

export default GraphCard;
