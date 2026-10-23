import React, { ReactNode } from 'react';

import { gvTag } from '../../utils/gvTag';
import Box from '../Box';
import Text from '../Text';

export interface Props {
  label: ReactNode;
  children: ReactNode;
}

/** A labelled field of a back office settings panel. */
const PanelField = ({ label, children }: Props) => (
  <Box {...gvTag('PanelField')} mb="var(--gv-space-4)">
    <Text variant="boSection" mb="var(--gv-space-2)">
      {label}
    </Text>
    {children}
  </Box>
);

export default PanelField;
