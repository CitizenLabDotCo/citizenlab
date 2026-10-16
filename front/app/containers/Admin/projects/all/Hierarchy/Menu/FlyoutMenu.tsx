import React, {
  Fragment,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useRef,
  useState,
} from 'react';

import {
  Box,
  Dropdown,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import FlyoutPanel from './FlyoutPanel';
import MenuRow, { MenuLink } from './MenuRow';
import {
  FLYOUT_GAP,
  FLYOUT_WIDTH,
  getFlyoutSide,
  getMenuSide,
} from './menuSide';
import moveMenuFocus from './moveMenuFocus';

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

// Enter and Space click with no pointer behind the click.
const isFromKeys = (event: MouseEvent<HTMLElement>) => event.detail === 0;

interface Props {
  label: string;
  opened: boolean;
  onClose: () => void;
  entries: MenuEntry[];
  // Below the button that opens it.
  top: string;
  // The menu's edge lined up with the button's. Flyouts open on the right
  // where there's room, else on the left.
  align?: 'left' | 'right';
}

// A menu of actions and of rows that open their choices beside it, on hover,
// click or the arrow key towards them; the other arrow comes back.
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
  const [flyoutSide, setFlyoutSide] = useState<'left' | 'right'>('right');
  // Each keyboard opening starts a new flyout, so it takes the focus again
  // even when it's the one already open.
  const [fromKeyboard, setFromKeyboard] = useState(false);
  const [keyboardOpenings, setKeyboardOpenings] = useState(0);
  const { isRtl } = useTheme();
  const flyout = useRef<HTMLDivElement>(null);
  // The row whose flyout is open, for the focus to come back to.
  const flyoutRow = useRef<HTMLElement | null>(null);

  const towardsFlyout = flyoutSide === 'right' ? 'ArrowRight' : 'ArrowLeft';
  const backFromFlyout = flyoutSide === 'right' ? 'ArrowLeft' : 'ArrowRight';

  const close = () => {
    setOpenKey(undefined);
    onClose();
  };

  // Hovering another row closes the open flyout. The focus would go with it,
  // so the hovered row takes it.
  const leaveFlyout = (row: HTMLElement) => {
    if (flyout.current?.contains(document.activeElement)) row.focus();
  };

  const openFlyout = (key: string, row: HTMLElement, keyboard: boolean) => {
    if (!keyboard && key !== openKey) leaveFlyout(row);
    flyoutRow.current = row;
    setOpenKey(key);
    setFlyoutTop(row.offsetTop);
    setFromKeyboard(keyboard);
    if (keyboard) setKeyboardOpenings((count) => count + 1);
  };

  const closeFlyout = (row: HTMLElement) => {
    leaveFlyout(row);
    setOpenKey(undefined);
  };

  const handleRowKeyDown =
    (key: string) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === towardsFlyout) {
        event.preventDefault();
        openFlyout(key, event.currentTarget, true);
      }
    };

  // A search box keeps its arrows for the caret.
  const handleFlyoutKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const row = flyoutRow.current;
    if (
      event.key !== backFromFlyout ||
      event.target instanceof HTMLInputElement ||
      !row
    ) {
      return;
    }
    event.preventDefault();
    setOpenKey(undefined);
    row.focus();
  };

  // Measured once the menu is on screen, so its rows' arrows point where
  // their flyouts will open.
  const measureSide = (menu: HTMLElement | null) => {
    if (!menu) return;
    const measured = getFlyoutSide(
      menu.getBoundingClientRect().right,
      window.innerWidth
    );
    if (measured !== flyoutSide) setFlyoutSide(measured);
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
        <Box
          ref={measureSide}
          role="menu"
          aria-label={label}
          onKeyDown={moveMenuFocus}
        >
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
                  flyoutSide={flyoutSide}
                  onMouseEnter={(event) =>
                    openFlyout(entry.key, event.currentTarget, false)
                  }
                  onClick={(event) =>
                    openFlyout(
                      entry.key,
                      event.currentTarget,
                      isFromKeys(event)
                    )
                  }
                  onKeyDown={handleRowKeyDown(entry.key)}
                />
              ) : 'link' in entry ? (
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  link={entry.link}
                  onMouseEnter={(event) => closeFlyout(event.currentTarget)}
                  onClick={close}
                />
              ) : (
                <MenuRow
                  icon={entry.icon}
                  label={entry.label}
                  danger={entry.danger}
                  onMouseEnter={(event) => closeFlyout(event.currentTarget)}
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
          <FlyoutPanel
            top={flyoutTop}
            side={flyoutSide}
            offset={MENU_WIDTH + FLYOUT_GAP}
            width={FLYOUT_WIDTH}
          >
            <Box
              key={`${openEntry.key}-${keyboardOpenings}`}
              ref={flyout}
              onKeyDown={handleFlyoutKeyDown}
            >
              {openEntry.flyout(fromKeyboard, close)}
            </Box>
          </FlyoutPanel>
        )
      }
    />
  );
};

export default FlyoutMenu;
