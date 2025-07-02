import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import { timelineHeight } from '../../utils';

const viewStyles = {
  height: timelineHeight,
  border: `1px solid ${colors.divider}`,
  topBorder: `1px solid ${colors.grey300}`,
};

export const HeaderRow = ({ children }: { children: React.ReactNode }) => (
  <Box display="flex" height={`${viewStyles.height}px`} w="0px">
    {children}
  </Box>
);

export const TopRowCell = ({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) => (
  <Box
    minWidth={`${width}px`}
    width={`${width}px`}
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderLeft={viewStyles.topBorder}
  >
    <Text fontSize="s" fontWeight="semi-bold">
      {children}
    </Text>
  </Box>
);

export const BottomRowCell = ({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) => (
  <Box
    minWidth={`${width}px`}
    width={`${width}px`}
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderLeft={viewStyles.border}
  >
    <Text fontSize="xs" color="grey600">
      {children}
    </Text>
  </Box>
);

export const HeaderBottomContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <Box borderTop={viewStyles.border}>{children}</Box>;
