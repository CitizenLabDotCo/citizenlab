import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Link as AriaLink,
  ToggleButton as AriaToggleButton,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import Tooltip from '../Tooltip';

import styles from './IconButton.module.css';
import '../tokens.css';

// Figma only draws Selected on Bordered.
type VariantProps =
  | {
      variant?: 'ghost';
      isSelected?: undefined;
    }
  | {
      variant: 'bordered';
      isSelected?: undefined;
    }
  | {
      variant: 'bordered';
      // Setting isSelected makes it a ToggleButton, which can't be a link.
      isSelected: boolean;
      href?: never;
    };

type ActionProps =
  | {
      href?: undefined;
      onPress?: (e: PressEvent) => void;
      'aria-expanded'?: boolean;
      'aria-controls'?: string;
    }
  | {
      // Renders a link instead of a button; navigation goes through the Provider's router.
      href: string;
      onPress?: never;
      'aria-expanded'?: never;
      'aria-controls'?: never;
    };

type IconButtonProps = VariantProps & {
  icon: IconName;
  // Names the button and is the text of its tooltip.
  'aria-label': string;
  size?: 28 | 24;
  tone?: 'default' | 'strong';
  isDisabled?: boolean;
  // Looks disabled but stays focusable; the tooltip shows the reason instead of the aria-label.
  disabledReason?: ReactNode;
  'aria-describedby'?: string;
  'data-cy'?: string;
} & ActionProps;

const IconButton = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 28,
  tone = 'default',
  isSelected,
  isDisabled,
  disabledReason,
  onPress,
  href,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-describedby': ariaDescribedBy,
  'data-cy': dataCy,
}: IconButtonProps) => {
  const className = `${styles.iconButton} ${styles[variant]} ${
    styles[`size${size}`]
  } ${tone === 'strong' ? styles.strong : ''}`;

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
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
      {isSelected && <span className={styles.selectedDot} aria-hidden />}
    </AriaToggleButton>
  ) : href && !hasReason ? (
    <AriaLink
      className={className}
      href={href}
      isDisabled={isDisabled}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
    </AriaLink>
  ) : (
    <AriaButton
      className={className}
      type="button"
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-describedby={ariaDescribedBy}
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
