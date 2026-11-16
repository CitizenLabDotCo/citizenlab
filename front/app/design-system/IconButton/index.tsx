import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  ToggleButton as AriaToggleButton,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import { SpinnerGraphic } from '../Spinner';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './IconButton.module.css';

export type IconButtonVariant = 'ghost' | 'bordered' | 'primary';

// Figma only draws Tone on Ghost, Selected on Bordered and Pending on Primary.
type VariantProps =
  | {
      variant?: 'ghost';
      tone?: 'default' | 'strong';
      isSelected?: undefined;
      onChange?: undefined;
      isPending?: undefined;
    }
  | {
      variant: 'bordered';
      tone?: undefined;
      // Setting isSelected or onChange makes it a ToggleButton.
      isSelected?: boolean;
      onChange?: (isSelected: boolean) => void;
      isPending?: undefined;
    }
  | {
      variant: 'primary';
      tone?: undefined;
      isSelected?: undefined;
      onChange?: undefined;
      isPending?: boolean;
    };

export type IconButtonProps = VariantProps & {
  icon: IconName;
  // Names the button and is the text of its tooltip.
  'aria-label': string;
  size?: 28 | 24;
  isDisabled?: boolean;
  // Looks disabled but stays focusable; the tooltip shows the reason instead of the aria-label.
  disabledReason?: ReactNode;
  onPress?: (e: PressEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  slot?: string;
  autoFocus?: boolean;
  id?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'data-cy'?: string;
};

const IconButton = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  tone,
  size = 28,
  isSelected,
  onChange,
  isPending = false,
  isDisabled,
  disabledReason,
  onPress,
  type = 'button',
  slot,
  id,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  autoFocus,
  'data-cy': dataCy,
}: IconButtonProps) => {
  const toneClass =
    variant === 'ghost' ? styles[tone === 'strong' ? 'strong' : 'default'] : '';
  const className = `${styles.iconButton} ${styles[variant]} ${toneClass} ${
    styles[`size${size}`]
  }`;

  const hasReason = !!disabledReason;

  const isToggle =
    variant === 'bordered' &&
    (isSelected !== undefined || onChange !== undefined);

  const button = isToggle ? (
    <AriaToggleButton
      className={className}
      isSelected={isSelected}
      onChange={hasReason ? undefined : onChange}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={hasReason ? undefined : onPress}
      slot={slot}
      id={id}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
      {isSelected && <span className={styles.selectedDot} aria-hidden />}
    </AriaToggleButton>
  ) : (
    <AriaButton
      className={className}
      // An aria-disabled submit button would still submit its form.
      type={hasReason ? 'button' : type}
      slot={slot}
      id={id}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      autoFocus={autoFocus}
      isPending={isPending}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={hasReason ? undefined : onPress}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      {isPending ? (
        <SpinnerGraphic tone="inverse" />
      ) : (
        <Icon name={icon} className={styles.icon} />
      )}
    </AriaButton>
  );

  return (
    <Tooltip content={hasReason ? disabledReason : ariaLabel}>{button}</Tooltip>
  );
};

export default IconButton;
