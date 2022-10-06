import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';
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
  fullWidth?: boolean;
}

const GraphCard = ({
  title,
  infoTooltipContent,
  exportMenu,
  children,
  fullWidth = true,
}: Props) => (
  <GraphCardContainer
    className={`dynamicHeight ${fullWidth ? 'fullWidth' : ''}`}
  >
    <GraphCardInnerClean>
      <GraphCardHeader>
        <GraphCardTitle>
          {title}

          {infoTooltipContent && (
            <IconTooltip
              content={<Text m="0px">{infoTooltipContent}</Text>}
              ml="8px"
              transform="translate(0,-2)"
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
