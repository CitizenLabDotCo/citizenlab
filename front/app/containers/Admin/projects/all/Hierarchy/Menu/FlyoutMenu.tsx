import React, { Fragment, KeyboardEvent, ReactNode, useState } from 'react';

import {
  Box,
  Dropdown,
  IconNames,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import MenuRow, { MenuLink } from './MenuRow';
import { getMenuSide } from './menuSide';

type EntryBase = {
  key: string;
  icon: IconNames;
  label: string;
  // A line above the entry, to set it apart from the ones before.
  dividerBefore?: boolean;
};

export type MenuEntry = EntryBase &
  (
    | { onSelect: () => void; danger?: boolean }
    | { link: MenuLink }
    // Its choices, beside the menu. Opened from the keyboard, they take the
    // focus; picking one closes the menu.
    | { flyout: (takeFocus: boolean, close: () => void) => ReactNode }
  );

const MENU_WIDTH = 240;

interface Props {
  label: string;
  opened: boolean;
  onClose: () => void;
  entries: MenuEntry[];
  // Below the button that opens it.
  top: string;
  // The menu's edge lined up with the button's. Flyouts open on the left, so
  // a menu with flyouts belongs to a button at the right of the page.
  align?: 'left' | 'right';
}

// A menu of actions and of rows that open their choices beside it, on hover,
// click or an arrow key.
const FlyoutMenu = ({
  label,
  opened,
  onClose,
  entries,
  top,
  align = 'right',
}: Props) => {
  const [openKey, setOpenKey] = useState<string>();
  const [flyoutTop, setFlyoutTop] = useState(0);
  // Each keyboard opening starts a new flyout, so it takes the focus again
  // even when it's the one already open.
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const [keyboardOpenings, setKeyboardOpenings] = useState(0);
  const { isRtl } = useTheme();

  const close = () => {
    setOpenKey(undefined);
    onClose();
  };

  const openFlyout = (key: string, row: HTMLElement, keyboard = false) => {
    setOpenKey(key);
    setFlyoutTop(row.offsetTop);
    setFromKeyboard(keyboard);
    if (keyboard) setKeyboardOpenings((count) => count + 1);
  };

  const handleFlyoutKeyDown =
    (key: string) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        openFlyout(key, event.currentTarget, true);
      }
    };

  const openEntry = entries.find((entry) => entry.key === openKey);
  const side = getMenuSide(align, isRtl);

  return (
    <Dropdown
      opened={opened}
      onClickOutside={close}
      right={side === 'right' ? '0px' : undefined}
      left={side === 'left' ? '0px' : undefined}
      top={top}
      width={`${MENU_WIDTH}px`}
      maxHeight="440px"
      content={
        <Box role="menu" aria-label={label}>
          {entries.map((entry) => (
            <Fragment key={entry.key}>
              {entry.dividerBefore && (
                <Box borderTop={`1px solid ${colors.grey200}`} my="6px" />
              )}
              {'flyout' in entry ? (
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  flyoutOpened={openKey === entry.key}
                  onMouseEnter={(event) =>
                    openFlyout(entry.key, event.currentTarget)
                  }
                  onClick={(event) =>
                    openFlyout(entry.key, event.currentTarget)
                  }
                  onKeyDown={handleFlyoutKeyDown(entry.key)}
                />
              ) : 'link' in entry ? (
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  link={entry.link}
                  onMouseEnter={() => setOpenKey(undefined)}
                  onClick={close}
                />
              ) : (
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  danger={entry.danger}
                  onMouseEnter={() => setOpenKey(undefined)}
                  onClick={() => {
                    entry.onSelect();
                    close();
                  }}
                />
              )}
            </Fragment>
          ))}
        </Box>
      }
      footer={
        openEntry &&
        'flyout' in openEntry && (
          <Box
            position="absolute"
            top={`${flyoutTop}px`}
            right={`${MENU_WIDTH + 4}px`}
            width="240px"
            maxHeight="400px"
            overflowY="auto"
            p="6px"
            bgColor={colors.white}
            border={`1px solid ${colors.grey300}`}
            borderRadius={bo.panelBorderRadius}
          >
            <Fragment key={`${openEntry.key}-${keyboardOpenings}`}>
              {openEntry.flyout(fromKeyboard, close)}
            </Fragment>
          </Box>
        )
      }
    />
  );
};

export default FlyoutMenu;
