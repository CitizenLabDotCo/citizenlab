import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

type Props = {
  children: ReactNode;
  // The caller draws the whole button: a row, a toggle, an info icon.
  className: string;
  onPress?: () => void;
  isDisabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  // Focusable but inactive, for a control that explains why in a tooltip.
  'aria-disabled'?: boolean;
  'data-cy'?: string;
};

// React Aria's press and focus handling without the design-system Button's box.
const UnstyledButton = ({
  children,
  className,
  onPress,
  isDisabled,
  id,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-disabled': ariaDisabled,
  'data-cy': dataCy,
}: Props) => (
  <AriaButton
    className={className}
    onPress={onPress}
    isDisabled={isDisabled}
    id={id}
    aria-label={ariaLabel}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    aria-disabled={ariaDisabled}
    data-cy={dataCy}
  >
    {children}
  </AriaButton>
);

export default UnstyledButton;
