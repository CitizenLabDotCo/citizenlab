import React from 'react';

// components
import {
  Box,
  Text,
  Title,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { GraphCardInnerClean } from 'components/admin/GraphWrappers';
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
}

const GraphCard = ({
  title,
  infoTooltipContent,
  exportMenu,
  viewToggle,
  children,
}: Props) => (
  <Box p="10px" width="100%">
    <GraphCardInnerClean>
      {/* <GraphCardHeader> */}
      <Box
        display="flex"
        minHeight="64px"
        alignItems="center"
        justifyContent="space-between"
        mb="20px"
        p="20px"
      >
        <Box display="flex" flexDirection="row" alignItems="center">
          <Title m="0px" mb="0px" variant="h2" as="h3" color="primary">
            {title}
          </Title>

          {infoTooltipContent && (
            <IconTooltip
              content={
                <Text m="0px" mb="0px" fontSize="s">
                  {infoTooltipContent}
                </Text>
              }
              ml="8px"
              theme="light"
              transform="translate(0,1)"
            />
          )}
        </Box>
        <Box display="flex" flexDirection="row">
          {exportMenu && <ReportExportMenu {...exportMenu} />}
          {viewToggle && (
            <Box ml="12px">
              <ViewToggle {...viewToggle} />
            </Box>
          )}
        </Box>
        {/* </GraphCardHeader> */}
      </Box>
      {children}
    </GraphCardInnerClean>
  </Box>
);

export default GraphCard;
