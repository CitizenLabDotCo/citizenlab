import React, { ReactNode, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import PanelRowButton from './PanelRowButton';

interface Props {
  label: string;
  defaultOpen?: boolean;
  variant?: 'card' | 'row';
  /** Shown as a pill in the card header while the group is closed. */
  summary?: string;
  children: ReactNode;
}

const PanelGroup = ({
  label,
  defaultOpen = false,
  variant = 'card',
  summary,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((open) => !open);

  if (variant === 'row') {
    return (
      <Box borderTop={`1px solid ${colors.grey200}`}>
        <PanelRowButton
          label={label}
          icon={open ? 'chevron-down' : 'chevron-right'}
          ariaExpanded={open}
          onClick={toggle}
        />
        {open && <Box pb="16px">{children}</Box>}
      </Box>
    );
  }

  return (
    <Box mb="10px">
      <SetupCard
        title={label}
        action={summary && !open && <SummaryPill label={summary} />}
        button={{
          icon: open ? 'chevron-up' : 'chevron-down',
          expanded: open,
          onClick: toggle,
        }}
      >
        {open && children}
      </SetupCard>
    </Box>
  );
};

export default PanelGroup;
