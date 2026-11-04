import React, { ReactNode } from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

const SIDE_WIDTH = '308px';
const PANEL_GAP = '8px';

interface Props {
  /** The cards next to the list: what needs attention, then actions. */
  side: ReactNode;
  children: ReactNode;
}

// The frame every method's Manage view shares. Each column scrolls on its own,
// so the cards stay in view while the list is scrolled.
const ManageLayout = ({ side, children }: Props) => (
  <Box display="flex" gap={PANEL_GAP} flexGrow={1} minWidth="0" minHeight="0">
    <Box
      flex={`0 0 ${SIDE_WIDTH}`}
      width={SIDE_WIDTH}
      minHeight="0"
      overflowY="auto"
      display="flex"
      flexDirection="column"
      gap={PANEL_GAP}
    >
      {side}
    </Box>
    <Box
      flexGrow={1}
      minWidth="0"
      minHeight="0"
      overflowY="auto"
      position="relative"
      p="18px"
      borderRadius={bo.panelBorderRadius}
      background={colors.white}
    >
      {children}
    </Box>
  </Box>
);

export default ManageLayout;
