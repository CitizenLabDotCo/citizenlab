import React from 'react';

// components
import { Box, Text, IconTooltip } from '@citizenlab/cl2-component-library';
import {
  GraphCard as GraphCardContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardInnerClean,
} from 'components/admin/GraphWrappers';
import ReportExportMenu, {
  ReportExportMenuProps,
} from 'components/admin/ReportExportMenu';
import ViewToggle, { Props as ViewToggleProps } from './ViewToggle';

interface Props {
  title: string | React.ReactNode;
  infoTooltipContent?: React.ReactChild;
  exportMenu?: ReportExportMenuProps;
  viewToggle?: ViewToggleProps;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const GraphCard = ({
  title,
  infoTooltipContent,
  exportMenu,
  viewToggle,
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
              content={
                <Text m="0px" mb="0px" fontSize="s">
                  {infoTooltipContent}
                </Text>
              }
              ml="8px"
              theme="light"
            />
          )}
        </GraphCardTitle>
        <Box display="flex" flexDirection="row">
          {exportMenu && <ReportExportMenu {...exportMenu} />}
          {viewToggle && (
            <Box ml="12px">
              <ViewToggle {...viewToggle} />
            </Box>
          )}
        </Box>
      </GraphCardHeader>
      {children}
    </GraphCardInnerClean>
  </GraphCardContainer>
);

export default GraphCard;
