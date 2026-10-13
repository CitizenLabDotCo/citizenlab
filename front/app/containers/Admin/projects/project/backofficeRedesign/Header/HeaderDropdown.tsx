import React, { ReactNode, useRef } from 'react';

import {
  Box,
  Button,
  ButtonStyles,
  Dropdown,
  IconNames,
  bo,
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
    <>
      <Box ref={triggerRef} display="inline-block">
        <Button
          buttonStyle={buttonStyle}
          height={bo.buttonMedium.height}
          padding={bo.buttonMedium.padding}
          fontSize={bo.buttonMedium.fontSize}
          iconSize={bo.buttonMedium.iconSize}
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
        top="36px"
        right="0px"
        width={width}
        maxHeight="none"
        zIndex="2000"
        borderRadius={bo.borderRadius}
        content={content}
      />
    </>
  );
};

export default HeaderDropdown;
