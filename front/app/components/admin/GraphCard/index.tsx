import React from 'react';

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
  id?: string;
  infoTooltipContent?: React.ReactChild;
  exportMenu?: ReportExportMenuProps;
  viewToggle?: ViewToggleProps;
  topRightStat?: string;
  children?: React.ReactNode;
}

const GraphCard = ({
  title,
  id,
  infoTooltipContent,
  exportMenu,
  viewToggle,
  topRightStat,
  children,
}: Props) => (
  <Box p="10px" width="100%" id={id}>
    <GraphCardInnerClean>
      <Box
        display="flex"
        minHeight="64px"
        alignItems="center"
        justifyContent="space-between"
        mb="20px"
        px="20px"
      >
        <Box display="flex" flexDirection="row" alignItems="center">
          <Title m="0px" mb="0px" styleVariant="h2" as="h3" color="primary">
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
          {topRightStat && <Box>{topRightStat}</Box>}
          {exportMenu && <ReportExportMenu {...exportMenu} />}
          {viewToggle && (
            <Box ml="12px">
              <ViewToggle {...viewToggle} />
            </Box>
          )}
        </Box>
      </Box>
      {children}
    </GraphCardInnerClean>
  </Box>
);

export default GraphCard;
