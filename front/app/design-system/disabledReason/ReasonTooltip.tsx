import React, { ReactNode, RefObject, useEffect, useState } from 'react';

import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components';

import { TOOLTIP_DELAY } from '../Tooltip';
import tooltipStyles from '../Tooltip/Tooltip.module.css';
import '../tokens.css';

type Props = {
  content: ReactNode;
  // The element the tooltip points at.
  triggerRef: RefObject<Element | null>;
  isHovered: boolean;
  isFocusVisible: boolean;
};

// The Tooltip for a control whose focusable element TooltipTrigger can't reach: the
// hidden input of a Switch or Radio, or a listbox option. It opens the same way: after
// the delay on hover, at once on keyboard focus. The control names the reason with
// aria-describedby itself.
const ReasonTooltip = ({
  content,
  triggerRef,
  isHovered,
  isFocusVisible,
}: Props) => {
  const [isHoverOpen, setIsHoverOpen] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setIsHoverOpen(false);
      return undefined;
    }
    const timeout = window.setTimeout(
      () => setIsHoverOpen(true),
      TOOLTIP_DELAY
    );
    return () => window.clearTimeout(timeout);
  }, [isHovered]);

  return (
    <TooltipTrigger isOpen={isHoverOpen || isFocusVisible}>
      <AriaTooltip
        triggerRef={triggerRef}
        placement="top"
        offset={4}
        className={tooltipStyles.tooltip}
      >
        {content}
      </AriaTooltip>
    </TooltipTrigger>
  );
};

export default ReasonTooltip;
