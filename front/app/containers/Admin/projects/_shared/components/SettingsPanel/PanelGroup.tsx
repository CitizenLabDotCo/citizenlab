import React, { ReactNode, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import PanelRowButton from './PanelRowButton';

interface Props {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One concern in a settings panel. The panel is too narrow to show every
 * setting at once, so each group opens on demand and the rows in between stay
 * scannable.
 */
const PanelGroup = ({ label, defaultOpen = false, children }: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box borderTop={`1px solid ${colors.grey200}`}>
      <PanelRowButton
        label={label}
        icon={open ? 'chevron-down' : 'chevron-right'}
        ariaExpanded={open}
        onClick={() => setOpen((open) => !open)}
      />
      {open && <Box pb="16px">{children}</Box>}
    </Box>
  );
};

export default PanelGroup;
