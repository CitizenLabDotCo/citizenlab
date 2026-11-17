import React, { ReactNode, useEffect, useRef, useState } from 'react';

import ReasonTooltip from 'design-system/disabledReason/ReasonTooltip';
import 'design-system/tokens.css';

interface Props {
  content?: string;
  children: ReactNode;
}

// A Disclosure renders its header button itself, so a design-system Tooltip
// can't wrap it. This points the same tooltip at that button: after the delay
// on hover, at once on keyboard focus.
const SetupCardTooltip = ({ content, children }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const trigger = wrapperRef.current?.querySelector('button') ?? null;
    triggerRef.current = trigger;
    if (!trigger || !content) return undefined;

    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    const focus = () => setIsFocusVisible(trigger.matches(':focus-visible'));
    const blur = () => setIsFocusVisible(false);

    trigger.addEventListener('mouseenter', enter);
    trigger.addEventListener('mouseleave', leave);
    trigger.addEventListener('focus', focus);
    trigger.addEventListener('blur', blur);
    return () => {
      trigger.removeEventListener('mouseenter', enter);
      trigger.removeEventListener('mouseleave', leave);
      trigger.removeEventListener('focus', focus);
      trigger.removeEventListener('blur', blur);
    };
  }, [content]);

  return (
    <div ref={wrapperRef}>
      {children}
      {content && (
        <ReasonTooltip
          content={content}
          triggerRef={triggerRef}
          isHovered={isHovered}
          isFocusVisible={isFocusVisible}
        />
      )}
    </div>
  );
};

export default SetupCardTooltip;
