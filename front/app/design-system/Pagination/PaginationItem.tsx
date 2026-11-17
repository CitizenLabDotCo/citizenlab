import React, { useCallback } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';

import messages from './messages';
import styles from './Pagination.module.css';

import '../tokens.css';

type PaginationItemProps =
  | {
      kind?: 'page';
      number: number;
      isSelected?: boolean;
      onPress?: () => void;
    }
  | {
      kind: 'previous' | 'next';
      isDisabled?: boolean;
      onPress?: () => void;
    }
  | { kind: 'ellipsis' };

const PaginationItem = (props: PaginationItemProps) => {
  const { formatMessage } = useIntl();
  const isSelected = 'isSelected' in props && !!props.isSelected;

  // React Aria's Button drops aria-current, so it is set on the element directly.
  const currentRef = useCallback(
    (element: HTMLButtonElement | null) => {
      if (!element) return;
      if (isSelected) {
        element.setAttribute('aria-current', 'page');
      } else {
        element.removeAttribute('aria-current');
      }
    },
    [isSelected]
  );

  if (props.kind === 'ellipsis') {
    return (
      <span className={`${styles.item} ${styles.ellipsis}`} aria-hidden>
        …
      </span>
    );
  }

  if (props.kind === 'previous' || props.kind === 'next') {
    const isPrevious = props.kind === 'previous';
    return (
      <AriaButton
        className={`${styles.item} ${styles.step}`}
        isDisabled={props.isDisabled}
        onPress={props.onPress}
        aria-label={formatMessage(
          isPrevious ? messages.previous : messages.next
        )}
      >
        <Icon
          name={isPrevious ? 'chevron-left-16' : 'chevron-right-16'}
          className={styles.icon}
        />
      </AriaButton>
    );
  }

  // TypeScript can't narrow on the optional `kind`, so the page variant is told apart by `number`.
  if (!('number' in props)) return null;

  return (
    <AriaButton
      className={`${styles.item} ${styles.page} ${
        isSelected ? styles.current : ''
      }`}
      onPress={props.onPress}
      ref={currentRef}
      aria-label={formatMessage(messages.page, { page: props.number })}
    >
      {props.number}
    </AriaButton>
  );
};

export default PaginationItem;
