import React, { ReactNode, useState } from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import SetupCard from 'containers/Admin/projects/project/backofficeRedesign/Event/SetupCard';

import PanelRowButton from './PanelRowButton';

interface Props {
  label: string;
  defaultOpen?: boolean;
  variant?: 'card' | 'row';
  children: ReactNode;
}

const PanelGroup = ({
  label,
  defaultOpen = false,
  variant = 'card',
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
    <Box mb="12px">
      <SetupCard
        title={label}
        action={
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
        }
      >
        {open && children}
      </SetupCard>
    </Box>
  );
};

export default PanelGroup;
