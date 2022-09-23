import React from 'react';

// components
import {
  GraphCard as GraphCardContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInnerClean,
} from 'components/admin/GraphWrappers';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import ReportExportMenu, {
  ReportExportMenuProps,
} from 'components/admin/ReportExportMenu';

interface Props {
  title: string | React.ReactNode;
  infoTooltipContent?: React.ReactChild;
  exportMenu?: ReportExportMenuProps;
  children?: React.ReactNode;
}

const GraphCard = ({
  title,
  infoTooltipContent,
  exportMenu,
  children,
}: Props) => (
  <GraphCardContainer className="fullWidth dynamicHeight">
    <GraphCardInnerClean>
      <GraphCardHeader>
        <GraphCardTitle>
          {title}

          {infoTooltipContent && (
            <IconTooltip
              content={infoTooltipContent}
              ml="8px"
              mt="-2px"
              theme="light"
            />
          )}
        </GraphCardTitle>
        {exportMenu && <ReportExportMenu {...exportMenu} />}
      </GraphCardHeader>
      {children}
    </GraphCardInnerClean>
  </GraphCardContainer>
);

export default GraphCard;
