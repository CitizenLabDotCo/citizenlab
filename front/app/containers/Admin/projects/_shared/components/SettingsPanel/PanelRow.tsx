import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import PanelRowButton from './PanelRowButton';

interface Props {
  label: string;
  onClick: () => void;
}

/** A settings panel row that opens its own surface rather than expanding. */
const PanelRow = ({ label, onClick }: Props) => (
  <Box borderTop={`1px solid ${colors.grey200}`}>
    <PanelRowButton label={label} icon="chevron-right" onClick={onClick} />
  </Box>
);

export default PanelRow;
