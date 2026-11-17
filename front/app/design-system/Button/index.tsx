import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Link as AriaLink,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import { SpinnerGraphic } from '../Spinner';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

type LabelProps =
  | { children: ReactNode; 'aria-label'?: string }
  // Without a label (the menu half of a Split button) the button needs an aria-label.
  | { children?: undefined; 'aria-label': string };

export type ButtonProps = LabelProps & {
  variant?: ButtonVariant;
  size?: 28 | 32;
  icon?: IconName;
  trailingIcon?: IconName;
  // Draws the dropdown chevron. Set it when the button is a MenuTrigger.
  hasMenu?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why.
  disabledReason?: ReactNode;
  onPress?: (e: PressEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  slot?: string;
  autoFocus?: boolean;
  // Goes somewhere while looking like a button (React Aria Link; client-side inside DesignSystemProvider).
  href?: string;
  target?: '_blank' | '_self';
  id?: string;
  'aria-describedby'?: string;
  'data-cy'?: string;
};

const Button = ({
  children,
  variant = 'secondary',
  size = 32,
  icon,
  trailingIcon,
  hasMenu = false,
  isPending = false,
  isDisabled = false,
  disabledReason,
  onPress,
  type = 'button',
  form,
  slot,
  autoFocus,
  href,
  target,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-cy': dataCy,
}: ButtonProps) => {
  const isFilled = variant === 'primary' || variant === 'danger';
  const hasReason = !!disabledReason;

  const className = [
    styles.button,
    styles[variant],
    styles[`size${size}`],
    children === undefined ? styles.unlabelled : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {isPending ? (
        <SpinnerGraphic tone={isFilled ? 'inverse' : 'accent'} />
      ) : (
        icon && <Icon name={icon} className={styles.icon} />
      )}
      {children}
      {trailingIcon && <Icon name={trailingIcon} className={styles.icon} />}
      {hasMenu && <Icon name="chevron-down-12" className={styles.chevron} />}
    </>
  );

  if (href && !hasReason) {
    return (
      <AriaLink
        className={className}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        isDisabled={isDisabled}
        autoFocus={autoFocus}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-cy={dataCy}
      >
        {content}
      </AriaLink>
    );
  }

  const button = (
    <AriaButton
      className={className}
      // An aria-disabled submit button would still submit its form.
      type={hasReason ? 'button' : type}
      form={form}
      slot={slot}
      autoFocus={autoFocus}
      id={id}
      isPending={isPending}
      isDisabled={isDisabled && !hasReason}
      aria-disabled={hasReason ? true : undefined}
      onPress={hasReason ? undefined : onPress}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-cy={dataCy}
    >
      {content}
    </AriaButton>
  );

  if (!hasReason) return button;

  return <Tooltip content={disabledReason}>{button}</Tooltip>;
};

export default Button;
