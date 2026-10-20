import React, { useLayoutEffect, useRef, useState } from 'react';

import { Box, Button, Dropdown, bo } from '@citizenlab/cl2-component-library';

import DropdownMenuItem from 'components/UI/DropdownMenuItem';
import getPopoverPlacement from 'components/UI/PillPicker/getPopoverPlacement';

const GAP = 4;
const OFFSET = `calc(100% + ${GAP}px)`;

export interface FileAction {
  name: string;
  label: string;
  onClick: () => void;
}

interface Props {
  ariaLabel: string;
  actions: FileAction[];
}

const FileActionsMenu = ({ ariaLabel, actions }: Props) => {
  const [opened, setOpened] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Rows near the bottom of the scrolling file list would push the menu out
  // of view, so it opens upward when there is no room below.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!opened || !trigger || !menu) return;

    const placement = getPopoverPlacement(
      trigger,
      { height: menu.offsetHeight, width: menu.offsetWidth },
      GAP
    );
    setOpenUp(placement.openUp);
  }, [opened]);

  return (
    <Box position="relative" ref={triggerRef}>
      <Button
        buttonStyle="bo-text"
        icon="dots-horizontal"
        width="28px"
        height="28px"
        padding="0"
        ariaLabel={ariaLabel}
        ariaExpanded={opened}
        ariaHasPopup="menu"
        onClick={() => setOpened(!opened)}
      />
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        top={openUp ? undefined : OFFSET}
        bottom={openUp ? OFFSET : undefined}
        right="0px"
        width="180px"
        zIndex="10"
        borderRadius={bo.borderRadius}
        content={
          <Box ref={menuRef} role="menu">
            {actions.map(({ name, label, onClick }) => (
              <DropdownMenuItem
                key={name}
                label={label}
                onClick={() => {
                  setOpened(false);
                  onClick();
                }}
              />
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default FileActionsMenu;
