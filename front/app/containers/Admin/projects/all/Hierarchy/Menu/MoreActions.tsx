import React, { MouseEvent, useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FlyoutMenu, { MenuEntry } from './FlyoutMenu';

interface Props {
  entries: MenuEntry[];
  align?: 'left' | 'right';
}

// "⋯": the actions on a level, a card or a row. Nothing shows without any.
const MoreActions = ({ entries, align }: Props) => {
  const { formatMessage } = useIntl();
  // Where the button is on screen while the menu is open.
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const label = formatMessage(messages.moreActions);
  const opened = anchor !== null;

  // The menu floats over the page, pinned to where the button was. Table cells
  // and the table's scroll area cut off whatever overflows them; they don't cut
  // off a fixed layer. Scrolling anything but the menu would leave it behind,
  // so it closes.
  useEffect(() => {
    if (!opened) return;

    const close = (event: Event) => {
      if (
        event.target instanceof Node &&
        layer.current?.contains(event.target)
      ) {
        return;
      }
      setAnchor(null);
    };

    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [opened]);

  if (entries.length === 0) return null;

  // Picking from the menu takes away what had the focus, so it goes back to
  // the button. A click elsewhere keeps it where it went.
  const close = () => {
    const focusInMenu = layer.current?.contains(document.activeElement);
    setAnchor(null);
    if (focusInMenu) button.current?.focus();
  };

  const toggle = (event: MouseEvent<HTMLElement>) => {
    setAnchor(opened ? null : event.currentTarget.getBoundingClientRect());
  };

  return (
    <Box flex="none">
      <Tooltip
        content={label}
        placement="bottom"
        theme="dark"
        disabled={opened}
      >
        <Button
          ref={button}
          type="button"
          buttonStyle="bo-text"
          icon="dots-horizontal"
          iconSize="16px"
          iconColor={colors.coolGrey600}
          padding="4px"
          ariaLabel={label}
          ariaExpanded={opened}
          ariaHasPopup="menu"
          onClick={toggle}
        />
      </Tooltip>
      {anchor && (
        <Box
          ref={layer}
          position="fixed"
          top={`${anchor.top}px`}
          left={`${anchor.left}px`}
          width={`${anchor.width}px`}
          height={`${anchor.height}px`}
          zIndex="10"
        >
          <FlyoutMenu
            label={label}
            opened
            onClose={close}
            entries={entries}
            top="calc(100% + 4px)"
            align={align}
          />
        </Box>
      )}
    </Box>
  );
};

export default MoreActions;
