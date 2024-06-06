import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

type TippyProps = Omit<
  React.ComponentProps<typeof Tippy>,
  'interactive' | 'plugins' | 'role'
>;

const useActiveElement = () => {
  const [active, setActive] = useState(document.activeElement);

  const handleFocusIn = () => {
    setActive(document.activeElement);
  };

  useEffect(() => {
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return active;
};

const Tooltip = ({ children, ...rest }: TippyProps) => {
  const [isFocused, setIsFocused] = useState<boolean | undefined>(undefined);
  const [key, setKey] = useState<number>(0);
  const activeElement = useActiveElement();

  // Check if the active element is inside the tooltip
  useEffect(() => {
    const tooltip = document.getElementById('tooltip');
    if (tooltip && tooltip.contains(activeElement)) {
      setIsFocused(true);
    } else setIsFocused(false);
  }, [activeElement]);

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
      {...rest}
    >
      <Box id="tooltip" width="fit-content">
        {children}
      </Box>
    </Tippy>
  );
};

export default Tooltip;
