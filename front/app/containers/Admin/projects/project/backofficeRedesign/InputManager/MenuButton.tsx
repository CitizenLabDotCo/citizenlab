import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { Box, Dropdown } from '@citizenlab/cl2-component-library';

interface Props {
  trigger: (props: { opened: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  width?: string;
  align?: 'left' | 'right';
}

const MenuButton = ({
  trigger,
  children,
  width = '240px',
  align = 'left',
}: Props) => {
  const [opened, setOpened] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpened(false);

  // Closes on keydown and marks the key as handled, so a side panel around
  // the menu, which closes on the same key, stays open.
  useEffect(() => {
    if (!opened) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      setOpened(false);
    };

    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [opened]);

  const handleClickOutside = (event: { target: EventTarget | null }) => {
    if (
      event.target instanceof Node &&
      triggerRef.current?.contains(event.target)
    ) {
      return;
    }
    close();
  };

  return (
    <Box position="relative" display="inline-flex">
      <Box ref={triggerRef} display="inline-flex">
        {trigger({ opened, toggle: () => setOpened(!opened) })}
      </Box>
      <Dropdown
        opened={opened}
        onClickOutside={handleClickOutside}
        top="calc(100% + 4px)"
        left={align === 'left' ? '0px' : undefined}
        right={align === 'right' ? '0px' : undefined}
        width={width}
        zIndex="1001"
        content={<>{children(close)}</>}
      />
    </Box>
  );
};

export default MenuButton;
