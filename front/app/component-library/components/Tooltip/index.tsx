import React, { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line no-restricted-imports
import Tippy from '@tippyjs/react';

import Box from '../Box';

export type TooltipProps = Omit<
  React.ComponentProps<typeof Tippy>,
  'interactive' | 'plugins' | 'role'
> & {
  width?: string;
  useWrapper?: boolean;
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

const PLUGINS = [
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
];

const TippyComponent = ({
  children,
  theme,
  width,
  componentKey,
  isFocused,
  setIsFocused,
  setKey,
  tooltipId,
  onHidden,
  ...rest
}: {
  children: React.ReactNode;
  theme: string;
  width: string | undefined;
  componentKey: number;
  isFocused: boolean | undefined;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setKey: React.Dispatch<React.SetStateAction<number>>;
  tooltipId: React.MutableRefObject<string>;
} & TooltipProps) => {
  const handleOnHidden = useCallback(() => {
    setIsFocused(undefined);
    setKey((prev) => prev + 1);
  }, [setIsFocused, setKey]);

  return (
    <Tippy
      key={componentKey}
      plugins={PLUGINS}
      interactive={true}
      role="tooltip"
      visible={isFocused}
      // Ensures tippy works with both keyboard and mouse
      onHidden={onHidden ?? handleOnHidden}
      theme={theme}
      {...rest}
    >
      <Box as="span" id={tooltipId.current} w={width || 'fit-content'}>
        {children}
      </Box>
    </Tippy>
  );
};

const Tooltip = ({
  children,
  theme = 'light',
  width,
  // This prop is used to determine if the native Tippy component should be wrapped in a Box component
  useWrapper = true,
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

  if (useWrapper) {
    return (
      <TippyComponent
        componentKey={key}
        theme={theme}
        width={width}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        setKey={setKey}
        tooltipId={tooltipId}
        {...rest}
      >
        {children}
      </TippyComponent>
    );
  } else {
    return (
      // This option is used for more accessible tooltips when useWrapper is false
      <Box as="span" id={tooltipId.current} w={width || 'fit-content'}>
        <TippyComponent
          componentKey={key}
          theme={theme}
          width={width}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          setKey={setKey}
          tooltipId={tooltipId}
          {...rest}
        >
          {children}
        </TippyComponent>
      </Box>
    );
  }
};

export default Tooltip;
