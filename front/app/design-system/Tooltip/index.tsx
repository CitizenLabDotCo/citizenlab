import React, { ReactElement, ReactNode } from 'react';

import {
  Tooltip as AriaTooltip,
  TooltipTrigger,
  Placement,
} from 'react-aria-components';

import '../tokens.css';
import styles from './Tooltip.module.css';

// Timing is a prop, not CSS, so it lives here next to the motion variables.
export const TOOLTIP_DELAY = 400;
export const TOOLTIP_CLOSE_DELAY = 0;

type Props = {
  content: ReactNode;
  // A focusable element: a design-system Button, IconButton, Link, etc.
  children: ReactElement;
  placement?: Placement;
  isDisabled?: boolean;
};

const Tooltip = ({
  content,
  children,
  placement = 'top',
  isDisabled,
}: Props) => (
  <TooltipTrigger
    delay={TOOLTIP_DELAY}
    closeDelay={TOOLTIP_CLOSE_DELAY}
    isDisabled={isDisabled}
  >
    {children}
    <AriaTooltip placement={placement} offset={4} className={styles.tooltip}>
      {content}
    </AriaTooltip>
  </TooltipTrigger>
);

export default Tooltip;
