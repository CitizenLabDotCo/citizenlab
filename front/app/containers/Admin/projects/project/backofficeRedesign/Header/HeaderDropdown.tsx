import React, { ReactNode, useRef } from 'react';

import {
  Box,
  Button,
  Dropdown,
  IconNames,
} from '@citizenlab/cl2-component-library';

export type HeaderDropdownName = 'publish' | 'share';

interface Props {
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
  label: ReactNode;
  icon?: IconNames;
  id: string;
  width: string;
  content: JSX.Element;
}

const HeaderDropdown = ({
  opened,
  onOpenChange,
  label,
  icon,
  id,
  width,
  content,
}: Props) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: { target: EventTarget | null }) => {
    if (triggerRef.current?.contains(event.target as Node)) return;
    onOpenChange(false);
  };

  return (
    <Box position="relative">
      <Box ref={triggerRef} display="inline-block">
        <Button
          buttonStyle="admin-dark"
          size="s"
          padding="4px 8px"
          icon={icon}
          iconPos="right"
          iconSize="16px"
          onClick={() => onOpenChange(!opened)}
          id={id}
        >
          {label}
        </Button>
      </Box>

      <Dropdown
        opened={opened}
        onClickOutside={handleClickOutside}
        top="40px"
        right="0px"
        width={width}
        maxHeight="none"
        zIndex="2000"
        content={content}
      />
    </Box>
  );
};

export default HeaderDropdown;
