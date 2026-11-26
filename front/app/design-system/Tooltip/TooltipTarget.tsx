import React, { ReactNode } from 'react';

import { Focusable } from 'react-aria-components';

type Props = {
  children: ReactNode;
  className?: string;
  // For a mark without text, such as an icon: it then reads as an image.
  'aria-label'?: string;
};

// The Tooltip only opens on a focusable trigger; this makes text or an icon one.
const TooltipTarget = ({
  children,
  className,
  'aria-label': ariaLabel,
}: Props) => (
  <Focusable>
    <span
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
    </span>
  </Focusable>
);

export default TooltipTarget;
