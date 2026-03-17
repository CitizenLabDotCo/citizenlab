import React, { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line no-restricted-imports
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';

import Box from '../Box';

export type TooltipProps = Omit<
  React.ComponentProps<typeof Tippy>,
  'interactive' | 'plugins' | 'role' | 'aria'
> & {
  width?: string;
  useContentWrapper?: boolean;
};

const useActiveElement = () => {
  const [active, setActive] = useState(document.activeElement);

  const handleFocusIn = () => {
    setActive(document.activeElement);
  };

  const handleOutsideClick = () => {
    setActive(null);
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return active;
};

const PLUGINS = [followCursor];

const Tooltip = ({
  children,
  theme = 'light',
  width,
  // This prop is used to determine if the native Tippy component content should be wrapped in a Box component
  useContentWrapper = true,
  ...rest
}: TooltipProps) => {
  const tooltipId = useRef(
    `tooltip-${Math.random().toString(36).substring(7)}`
  );
  const [isFocused, setIsFocused] = useState<boolean | undefined>(undefined);
  const [key, setKey] = useState<number>(0);
  const activeElement = useActiveElement();
  // Ref-based flag to track when the user explicitly hid the tooltip via
  // click/Space/Escape. Using a ref (not state) avoids re-render timing
  // issues with the document-level click/focusin handlers in useActiveElement.
  const manuallyHiddenRef = useRef(false);

  // Check if the active element is inside the tooltip
  useEffect(() => {
    const tooltip = document.getElementById(tooltipId.current);
    const tooltipContent = document.querySelector('.tippy-content');
    if (tooltip && tooltip.contains(activeElement)) {
      if (!manuallyHiddenRef.current) {
        setIsFocused(true);
      }
    } else if (
      isFocused &&
      tooltipContent &&
      !tooltipContent.contains(activeElement)
    ) {
      setIsFocused(false);
      manuallyHiddenRef.current = false;
    }
  }, [activeElement, isFocused]);

  // Handle click (Space/Enter on button) to toggle tooltip visibility, and
  // Escape to close. Uses native listeners so they fire before document-level
  // handlers in useActiveElement, and stopPropagation prevents Escape from
  // closing parent dialogs.
  useEffect(() => {
    const tooltip = document.getElementById(tooltipId.current);
    if (!tooltip) return;

    const handleClick = (event: MouseEvent) => {
      event.stopPropagation();
      if (manuallyHiddenRef.current) {
        manuallyHiddenRef.current = false;
        setIsFocused(true);
      } else {
        manuallyHiddenRef.current = true;
        setIsFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !manuallyHiddenRef.current) {
        event.stopPropagation();
        manuallyHiddenRef.current = true;
        setIsFocused(false);
      }
    };

    tooltip.addEventListener('click', handleClick);
    tooltip.addEventListener('keydown', handleKeyDown);
    return () => {
      tooltip.removeEventListener('click', handleClick);
      tooltip.removeEventListener('keydown', handleKeyDown);
    };
  }, [key]);

  // This component sometimes crashes because of re-renders.
  // This useCallback slightly improves the situation (i.e. it makes it
  // slightly less likely for the component to crash).
  // But in the end we just need to completely rewrite this whole component
  // to fix the issue properly.
  // https://www.notion.so/govocal/Fix-Tooltip-component-16f9663b7b2680a48aebdf2ace15d1f8
  const handleOnHidden = useCallback(() => {
    // When manually hidden (click/Space/Escape toggle), skip the key
    // increment and isFocused reset. This preserves the Tippy instance so
    // the user can re-open it with another click/Space.
    if (!manuallyHiddenRef.current) {
      setIsFocused(undefined);
      setKey((prev) => prev + 1);
    }
  }, [setIsFocused, setKey]);

  if (useContentWrapper) {
    return (
      <Tippy
        key={key}
        plugins={PLUGINS}
        interactive={true}
        role="tooltip"
        aria={{ expanded: false }}
        visible={isFocused}
        // Ensures tippy works with both keyboard and mouse
        onHidden={handleOnHidden}
        theme={theme}
        {...rest}
      >
        <Box as="span" id={tooltipId.current} w={width || 'fit-content'}>
          {children}
        </Box>
      </Tippy>
    );
  } else {
    return (
      // This Box is used for more accessible tooltips when useContentWrapper is false
      <Box as="span" id={tooltipId.current} w={width || 'fit-content'}>
        <Tippy
          key={key}
          plugins={PLUGINS}
          interactive={true}
          role="tooltip"
          aria={{ expanded: false }}
          visible={isFocused}
          // Ensures tippy works with both keyboard and mouse
          onHidden={handleOnHidden}
          theme={theme}
          {...rest}
        >
          {children}
        </Tippy>
      </Box>
    );
  }
};

export default Tooltip;
