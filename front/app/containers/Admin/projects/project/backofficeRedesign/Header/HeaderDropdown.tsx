import React, { ReactNode, useRef } from 'react';

import {
  Box,
  Button,
  ButtonStyles,
  Dropdown,
  IconNames,
} from '@citizenlab/cl2-component-library';

export type HeaderDropdownName = 'publish' | 'share';

interface Props {
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
  label: ReactNode;
  buttonStyle: ButtonStyles;
  icon?: IconNames;
  id: string;
  width: string;
  content: JSX.Element;
}

const HeaderDropdown = ({
  opened,
  onOpenChange,
  label,
  buttonStyle,
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
          buttonStyle={buttonStyle}
          icon={icon}
          iconPos="right"
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
