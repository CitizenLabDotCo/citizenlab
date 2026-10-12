import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  empty?: boolean;
  children: ReactNode;
}

// Mirrors an icon row of the event page's information card.
const PreviewInfoRow = ({ icon, empty = false, children }: Props) => (
  <Box display="flex" alignItems="flex-start" gap="8px">
    <Box flex="0 0 24px" mt="2px" display="flex">
      <Icon
        name={icon}
        width="24px"
        height="24px"
        fill={empty ? colors.coolGrey300 : colors.coolGrey600}
      />
    </Box>
    <Box flex="1" minWidth="0">
      {children}
    </Box>
  </Box>
);

export default PreviewInfoRow;
