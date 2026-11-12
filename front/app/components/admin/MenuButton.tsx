import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  Box,
  Dropdown,
  DropdownListItem,
  bo,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const MenuContent = styled.div`
  ${DropdownListItem} {
    font-size: ${bo.controlFontSize}px;
    line-height: 20px;
    padding: 8px 12px;
    border-radius: ${bo.borderRadius};
  }
`;

interface Props {
  trigger: (props: { opened: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  width?: string;
  align?: 'left' | 'right';
  triggerWidth?: string;
  portal?: boolean;
}

interface Position {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight: number;
}

const MenuButton = ({
  trigger,
  children,
  width = '240px',
  align = 'left',
  triggerWidth,
  portal = false,
}: Props) => {
  const [opened, setOpened] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    maxHeight: 320,
  });
  const close = () => setOpened(false);

  useLayoutEffect(() => {
    if (!opened || !portal) return;
    const place = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = Number.parseInt(width, 10);
      const roomBelow = window.innerHeight - rect.bottom;
      const openAbove = roomBelow < 220 && rect.top > roomBelow;
      const left = align === 'right' ? rect.right - menuWidth : rect.left;
      const next = {
        top: openAbove ? undefined : rect.bottom + 4,
        bottom: openAbove ? window.innerHeight - rect.top + 4 : undefined,
        left: Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8)),
        maxHeight: Math.max(
          80,
          Math.min(320, (openAbove ? rect.top : roomBelow) - 28)
        ),
      };
      setPosition((previous) =>
        previous.top === next.top &&
        previous.bottom === next.bottom &&
        previous.left === next.left &&
        previous.maxHeight === next.maxHeight
          ? previous
          : next
      );
    };
    place();
    window.addEventListener('resize', place);
    document.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', place, true);
    };
  }, [opened, portal, align, width]);

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

  const menu = (
    <Dropdown
      opened={opened}
      onClickOutside={handleClickOutside}
      top={
        portal
          ? position.top === undefined
            ? 'auto'
            : '0px'
          : 'calc(100% + 4px)'
      }
      bottom={portal && position.bottom !== undefined ? '0px' : undefined}
      left={portal || align === 'left' ? '0px' : undefined}
      right={!portal && align === 'right' ? '0px' : undefined}
      width={width}
      borderRadius={bo.borderRadius}
      maxHeight={portal ? `${position.maxHeight}px` : undefined}
      zIndex="2000"
      content={<MenuContent>{children(close)}</MenuContent>}
    />
  );

  return (
    <Box position="relative" display="inline-flex" width={triggerWidth}>
      <Box ref={triggerRef} display="inline-flex" width={triggerWidth}>
        {trigger({ opened, toggle: () => setOpened(!opened) })}
      </Box>
      {portal
        ? opened &&
          createPortal(
            <Box
              position="fixed"
              top={position.top === undefined ? undefined : `${position.top}px`}
              bottom={
                position.bottom === undefined
                  ? undefined
                  : `${position.bottom}px`
              }
              left={`${position.left}px`}
              zIndex="2000"
            >
              {menu}
            </Box>,
            document.body
          )
        : menu}
    </Box>
  );
};

export default MenuButton;
