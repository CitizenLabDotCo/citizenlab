import React, { ReactNode, useState } from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import SetupCard from 'containers/Admin/projects/project/backofficeRedesign/Event/SetupCard';
import SummaryPill from 'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/SummaryPill';

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
        action={
          <Box display="flex" alignItems="center" gap="4px">
            {summary && !open && <SummaryPill label={summary} />}
            <Button
              buttonStyle="bo-text"
              icon={open ? 'chevron-up' : 'chevron-down'}
              iconSize="16px"
              width="28px"
              height="28px"
              padding="0"
              ariaLabel={label}
              ariaExpanded={open}
              onClick={toggle}
            />
          </Box>
        }
      >
        {open && children}
      </SetupCard>
    </Box>
  );
};

export default PanelGroup;
