import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

type TippyProps = Omit<
  React.ComponentProps<typeof Tippy>,
  'interactive' | 'plugins' | 'role'
>;

const Tooltip = ({ children, ...rest }: TippyProps) => {
  const [key, setKey] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean | undefined>();

  useEffect(() => {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    const onFocus = () => {
      setIsFocused(true);
    };
    const onBlur = () => {
      setIsFocused(false);
    };
    tooltip.addEventListener('focusin', onFocus);
    tooltip.addEventListener('focusout', onBlur);

    return () => {
      tooltip.removeEventListener('focusin', onFocus);
      tooltip.removeEventListener('focusout', onBlur);
    };
  }, []);

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
      onHidden={() => {
        console.log('called');
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
