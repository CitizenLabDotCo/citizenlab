import React, { ReactNode } from 'react';

import { Button as AriaButton, MenuTrigger } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';

import styles from './FilterChip.module.css';
import messages from './messages';
import '../tokens.css';

type FilterChipProps = {
  // Facet: value, or a preset's own name.
  label: ReactNode;
  // The design-system Menu that changes the value. A preset has none: it
  // reads as plain text and is only removed.
  menu?: ReactNode;
  onRemove: () => void;
};

const FilterChip = ({ label, menu, onRemove }: FilterChipProps) => {
  const { formatMessage } = useIntl();

  return (
    <span className={styles.chip}>
      {menu ? (
        <MenuTrigger>
          <AriaButton className={styles.trigger}>
            <span className={styles.label}>{label}</span>
            <Icon name="chevron-down-12" className={styles.icon} />
          </AriaButton>
          {menu}
        </MenuTrigger>
      ) : (
        <span className={`${styles.trigger} ${styles.preset}`}>
          <span className={styles.label}>{label}</span>
        </span>
      )}
      <AriaButton
        className={styles.remove}
        onPress={onRemove}
        aria-label={formatMessage(messages.removeFilter)}
      >
        <Icon name="x-14" className={styles.icon} />
      </AriaButton>
    </span>
  );
};

export default FilterChip;
