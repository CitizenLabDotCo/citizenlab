import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import reset from '../reset.module.css';
import Tooltip from '../Tooltip';

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
  disabledReason?: ReactNode;
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
  disabledReason,
  'data-cy': dataCy,
}: Props) => {
  const hasReason = !!disabledReason;
  const button = (
    <AriaButton
      className={`${reset.button} ${className}`}
      onPress={hasReason || isDisabled ? undefined : onPress}
      isDisabled={isDisabled && !hasReason}
      id={id}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-disabled={hasReason || undefined}
      data-cy={dataCy}
    >
      {children}
    </AriaButton>
  );

  return hasReason ? (
    <Tooltip content={disabledReason}>{button}</Tooltip>
  ) : (
    button
  );
};

export default UnstyledButton;
