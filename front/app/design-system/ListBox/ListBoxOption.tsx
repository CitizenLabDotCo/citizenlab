import React, { ReactNode, useId, useRef } from 'react';

import { Key, ListBoxItem, Text } from 'react-aria-components';

import { useRegisterReasonKey } from '../disabledReason/reasonKeys';
import ReasonTooltip from '../disabledReason/ReasonTooltip';
import Icon, { IconName } from '../Icon';
import '../tokens.css';

import styles from './ListBox.module.css';

type LabelProps =
  | { children: string; textValue?: string }
  // A label that is not plain text needs a textValue for type-ahead and filtering.
  | { children: ReactNode; textValue: string };

export type ListBoxOptionProps = LabelProps & {
  id?: Key;
  description?: ReactNode;
  icon?: IconName;
  count?: ReactNode;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why; it can't be
  // selected. Give the option an id.
  disabledReason?: ReactNode;
  'data-cy'?: string;
};

// The mark follows the ListBox: selectionMode single draws the check, multiple the checkbox.
const ListBoxOption = ({
  children,
  textValue,
  id,
  description,
  icon,
  count,
  isDisabled,
  disabledReason,
  'data-cy': dataCy,
}: ListBoxOptionProps) => {
  const hasReason = !!disabledReason;
  const reasonId = useId();
  const optionRef = useRef<HTMLDivElement>(null);
  useRegisterReasonKey(id, hasReason);

  return (
    <ListBoxItem
      ref={optionRef}
      id={id}
      textValue={
        textValue ?? (typeof children === 'string' ? children : undefined)
      }
      isDisabled={isDisabled && !hasReason}
      // React Aria gives options no aria-disabled or extra description of their own.
      render={
        hasReason
          ? (props) =>
              'href' in props ? (
                <a {...props} />
              ) : (
                <div
                  {...props}
                  aria-disabled="true"
                  aria-describedby={[props['aria-describedby'], reasonId]
                    .filter(Boolean)
                    .join(' ')}
                />
              )
          : undefined
      }
      className={styles.option}
      data-cy={dataCy}
    >
      {({ selectionMode, isSelected, isHovered, isFocusVisible }) => (
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
          {selectionMode === 'single' && isSelected && (
            <Icon name="check-14" className={styles.check} />
          )}
          {hasReason && (
            <>
              <span id={reasonId} hidden>
                {disabledReason}
              </span>
              <ReasonTooltip
                content={disabledReason}
                triggerRef={optionRef}
                isHovered={isHovered}
                isFocusVisible={isFocusVisible}
              />
            </>
          )}
        </>
      )}
    </ListBoxItem>
  );
};

export default ListBoxOption;
