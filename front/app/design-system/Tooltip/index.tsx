import React, { ReactElement, ReactNode } from 'react';

import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components';

import styles from './Tooltip.module.css';
import '../tokens.css';

export { default as TooltipTarget } from './TooltipTarget';

// Timing is a prop, not CSS, so it lives here next to the motion variables.
export const TOOLTIP_DELAY = 400;
const TOOLTIP_CLOSE_DELAY = 0;

type Props = {
  content: ReactNode;
  // A focusable element: a design-system Button, IconButton, Link, etc.
  children: ReactElement;
  placement?: 'top' | 'bottom';
};

// Measure the wrapped text after the browser applies the viewport width limit.
const fitText = (element: HTMLDivElement | null) => {
  if (!element) return;

  element.style.width = '';
  const text = document.createRange();
  text.selectNodeContents(element);
  const lines = Array.from(text.getClientRects());

  if (lines.length < 2) return;

  const style = getComputedStyle(element);
  const padding =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const widest = Math.max(...lines.map(({ width }) => width));
  element.style.width = `${Math.ceil(widest + padding)}px`;
};

const Tooltip = ({ content, children, placement = 'top' }: Props) => (
  <TooltipTrigger delay={TOOLTIP_DELAY} closeDelay={TOOLTIP_CLOSE_DELAY}>
    {children}
    <AriaTooltip
      ref={typeof content === 'string' ? fitText : undefined}
      placement={placement}
      offset={4}
      className={styles.tooltip}
    >
      {content}
    </AriaTooltip>
  </TooltipTrigger>
);

export default Tooltip;
