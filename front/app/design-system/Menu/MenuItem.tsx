import React, { ReactNode } from 'react';

import { Key, MenuItem as AriaMenuItem, Text } from 'react-aria-components';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import renderAriaDisabled from '../disabledReason/renderAriaDisabled';
import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './Menu.module.css';

export type MenuItemVariant = 'default' | 'danger';

type LabelProps =
  | { children: string; textValue?: string }
  // A label that is not plain text needs a textValue for type-ahead.
  | { children: ReactNode; textValue: string };

export type MenuItemProps = LabelProps & {
  id?: Key;
  variant?: MenuItemVariant;
  icon?: IconName;
  description?: ReactNode;
  count?: ReactNode;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why; its action and
  // selection are ignored and the menu stays open. Give the item an id.
  disabledReason?: ReactNode;
  onAction?: () => void;
  'data-cy'?: string;
};

// The mark follows the Menu: selectionMode single draws the check, multiple the checkbox.
const MenuItem = ({
  children,
  textValue,
  id,
  variant = 'default',
  icon,
  description,
  count,
  isDisabled,
  disabledReason,
  onAction,
  'data-cy': dataCy,
}: MenuItemProps) => {
  const hasReason = !!disabledReason;
  useRegisterReasonKey(id, hasReason);

  const item = (
    <AriaMenuItem
      id={id}
      textValue={
        textValue ?? (typeof children === 'string' ? children : undefined)
      }
      isDisabled={isDisabled && !hasReason}
      onAction={hasReason ? undefined : onAction}
      shouldCloseOnSelect={hasReason ? false : undefined}
      render={hasReason ? renderAriaDisabled : undefined}
      className={`${styles.item} ${styles[variant]}`}
      data-cy={dataCy}
    >
      {({ selectionMode, isSelected, hasSubmenu }) => (
        <>
          {selectionMode === 'multiple' && (
            <span className={styles.checkbox} aria-hidden>
              {isSelected && (
                <Icon name="check-14" className={styles.checkboxIcon} />
              )}
            </span>
          )}
          {icon && <Icon name={icon} className={styles.icon} />}
          <span className={styles.text}>
            <Text slot="label" className={styles.label}>
              {children}
            </Text>
            {description && (
              <Text slot="description" className={styles.description}>
                {description}
              </Text>
            )}
          </span>
          {count !== undefined && <span className={styles.count}>{count}</span>}
          {hasSubmenu && (
            <Icon name="chevron-right-16" className={styles.chevron} />
          )}
          {selectionMode === 'single' && isSelected && (
            <Icon name="check-14" className={styles.check} />
          )}
        </>
      )}
    </AriaMenuItem>
  );

  if (!hasReason) return item;

  return <Tooltip content={disabledReason}>{item}</Tooltip>;
};

export default MenuItem;
