import React, { ReactElement, ReactNode } from 'react';

import { Group, MenuTrigger, PressEvent } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Button from '../Button';
import { IconName } from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './SplitButton.module.css';

export type SplitButtonProps = {
  // The label of the main action.
  children: ReactNode;
  // The design-system Menu that the chevron half opens.
  menu: ReactElement;
  variant?: 'primary' | 'secondary';
  size?: 28 | 32;
  icon?: IconName;
  onPress?: (e: PressEvent) => void;
  isDisabled?: boolean;
  isMenuDisabled?: boolean;
  'aria-label'?: string;
  'data-cy'?: string;
};

const SplitButton = ({
  children,
  menu,
  variant = 'primary',
  size = 32,
  icon,
  onPress,
  isDisabled = false,
  isMenuDisabled = false,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: SplitButtonProps) => {
  const { formatMessage } = useIntl();

  return (
    <Group
      className={`${styles.splitButton} ${styles[variant]} ${
        styles[`size${size}`]
      }`}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Button
        variant={variant}
        size={size}
        icon={icon}
        onPress={onPress}
        isDisabled={isDisabled}
      >
        {children}
      </Button>
      {variant === 'primary' && (
        <span className={styles.separator} aria-hidden />
      )}
      {/* MenuTrigger keeps the trigger pressed while the menu is open. */}
      <MenuTrigger>
        <Button
          variant={variant}
          size={size}
          hasMenu
          isDisabled={isMenuDisabled}
          aria-label={formatMessage(messages.moreOptions)}
        />
        {menu}
      </MenuTrigger>
    </Group>
  );
};

export default SplitButton;
