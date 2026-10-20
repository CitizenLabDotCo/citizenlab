import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  ClickOutside,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import getPopoverPlacement from 'components/UI/PillPicker/getPopoverPlacement';

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 6px 8px;
  border-radius: ${bo.borderRadius};
  font-size: ${bo.controlFontSize}px;
  line-height: 20px;
  color: ${bo.colors.textHeadingStrong};
  text-align: start;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${colors.grey100};
  }
`;

const GAP = 4;

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
    <ClickOutside
      onClickOutside={() => setOpened(false)}
      closeOnClickOutsideEnabled={opened}
    >
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
        {opened && (
          <Box
            ref={menuRef}
            role="menu"
            position="absolute"
            top={openUp ? undefined : `calc(100% + ${GAP}px)`}
            bottom={openUp ? `calc(100% + ${GAP}px)` : undefined}
            right="0"
            zIndex="10"
            w="180px"
            p="6px"
            background={colors.white}
            border={`1px solid ${colors.grey300}`}
            borderRadius={bo.panelBorderRadius}
            boxShadow="0 1px 2px rgba(15, 15, 15, 0.04), 0 6px 16px -2px rgba(15, 15, 15, 0.08)"
          >
            {actions.map(({ name, label, onClick }) => (
              <MenuItem
                key={name}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpened(false);
                  onClick();
                }}
              >
                {label}
              </MenuItem>
            ))}
          </Box>
        )}
      </Box>
    </ClickOutside>
  );
};

export default FileActionsMenu;
