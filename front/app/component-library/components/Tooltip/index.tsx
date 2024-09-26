import React, { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line no-restricted-imports
import Tippy from '@tippyjs/react';

import Box from '../Box';

export type TooltipProps = Omit<
  React.ComponentProps<typeof Tippy>,
  'interactive' | 'plugins' | 'role'
> & {
  width?: string;
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
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  });

  return active;
};

const Tooltip = ({
  children,
  theme = 'light',
  width,
  ...rest
}: TooltipProps) => {
  const tooltipId = useRef(
    `tooltip-${Math.random().toString(36).substring(7)}`
  );
  const [isFocused, setIsFocused] = useState<boolean | undefined>(undefined);
  const [key, setKey] = useState<number>(0);
  const activeElement = useActiveElement();

  // Check if the active element is inside the tooltip
  useEffect(() => {
    const tooltip = document.getElementById(tooltipId.current);
    const tooltipContent = document.querySelector('.tippy-content');
    if (tooltip && tooltip.contains(activeElement)) {
      setIsFocused(true);
    } else if (
      isFocused &&
      tooltipContent &&
      !tooltipContent.contains(activeElement)
    ) {
      setIsFocused(false);
    }
  }, [activeElement, isFocused]);

  return (
    <Tippy
      key={key}
      plugins={[
        {
          name: 'hideOnEsc',
          defaultValue: true,
          fn({ hide }) {
            function onKeyDown(event: KeyboardEvent) {
              if (event.key === 'Escape') {
                hide();
              }
            }

            return {
              onShow() {
                document.addEventListener('keydown', onKeyDown);
              },
              onHide() {
                document.removeEventListener('keydown', onKeyDown);
              },
            };
          },
        },
      ]}
      interactive={true}
      role="tooltip"
      visible={isFocused}
      // Ensures tippy works with both keyboard and mouse
      onHidden={() => {
        setIsFocused(undefined);
        setKey((prev) => prev + 1);
      }}
      theme={theme}
      {...rest}
    >
      <Box as="span" id={tooltipId.current} w={width || 'fit-content'}>
        {children}
      </Box>
    </Tippy>
  );
};

export default Tooltip;
