import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';

import { WINDOW_MARGIN } from './menuSide';

interface Props {
  // Level with the row that opened it.
  top: number;
  // Which side of the menu it opens on, and how far from the menu's opposite
  // edge.
  side: 'left' | 'right';
  offset: number;
  width: number;
  children: ReactNode;
}

// The box beside a menu that holds a row's choices. Next to a row low on the
// screen it would run past the bottom of the window, where the menu's fixed
// layer can't scroll to it, so it rises until it fits. It measures again as
// its choices load.
const FlyoutPanel = ({ top, side, offset, width, children }: Props) => {
  const panel = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;

    // Where its bottom would be without the lift it has now.
    const measure = () => {
      const { bottom } = element.getBoundingClientRect();
      const limit = window.innerHeight - WINDOW_MARGIN;
      setLift((current) => Math.max(0, bottom + current - limit));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [top]);

  return (
    <Box
      ref={panel}
      position="absolute"
      top={`${top - lift}px`}
      right={side === 'left' ? `${offset}px` : undefined}
      left={side === 'right' ? `${offset}px` : undefined}
      width={`${width}px`}
      maxHeight="400px"
      overflowY="auto"
      p="6px"
      bgColor={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius={bo.panelBorderRadius}
    >
      {children}
    </Box>
  );
};

export default FlyoutPanel;
