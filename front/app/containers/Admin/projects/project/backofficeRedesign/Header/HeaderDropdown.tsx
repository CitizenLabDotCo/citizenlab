import React, { ReactNode, useRef } from 'react';

import {
  Box,
  Dropdown,
  IconNames,
  NewBOButton,
  NewBOButtonStyle,
} from '@citizenlab/cl2-component-library';

export type HeaderDropdownName = 'publish' | 'share';

interface Props {
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
  label: ReactNode;
  buttonStyle: NewBOButtonStyle;
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
        <NewBOButton
          buttonStyle={buttonStyle}
          icon={icon}
          iconPos="right"
          onClick={() => onOpenChange(!opened)}
          id={id}
        >
          {label}
        </NewBOButton>
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
