import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  ToggleButton as AriaToggleButton,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './IconButton.module.css';

// Figma only draws Selected on Bordered.
type VariantProps =
  | {
      variant?: 'ghost';
      isSelected?: undefined;
    }
  | {
      variant: 'bordered';
      // Setting isSelected makes it a ToggleButton.
      isSelected?: boolean;
    };

type IconButtonProps = VariantProps & {
  icon: IconName;
  // Names the button and is the text of its tooltip.
  'aria-label': string;
  size?: 28 | 24;
  isDisabled?: boolean;
  // Looks disabled but stays focusable; the tooltip shows the reason instead of the aria-label.
  disabledReason?: ReactNode;
  onPress?: (e: PressEvent) => void;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'data-cy'?: string;
};

const IconButton = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 28,
  isSelected,
  isDisabled,
  disabledReason,
  onPress,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'data-cy': dataCy,
}: IconButtonProps) => {
  const className = `${styles.iconButton} ${styles[variant]} ${
    styles[`size${size}`]
  }`;

  const hasReason = !!disabledReason;

  const isToggle = variant === 'bordered' && isSelected !== undefined;

  const button = isToggle ? (
    <AriaToggleButton
      className={className}
      isSelected={isSelected}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={hasReason ? undefined : onPress}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
      {isSelected && <span className={styles.selectedDot} aria-hidden />}
    </AriaToggleButton>
  ) : (
    <AriaButton
      className={className}
      type="button"
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={hasReason ? undefined : onPress}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
    </AriaButton>
  );

  return (
    <Tooltip content={hasReason ? disabledReason : ariaLabel}>{button}</Tooltip>
  );
};

export default IconButton;
