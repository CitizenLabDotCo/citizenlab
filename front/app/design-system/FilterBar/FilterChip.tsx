import React, { ReactNode } from 'react';

import { Button as AriaButton, MenuTrigger } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './FilterChip.module.css';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FilterChipProps = {
  // Facet: value.
  label: ReactNode;
  // The design-system Menu that changes the value.
  menu: ReactNode;
  onRemove: () => void;
};

const FilterChip = ({ label, menu, onRemove }: FilterChipProps) => {
  const { formatMessage } = useIntl();

  return (
    <span className={styles.chip}>
      <MenuTrigger>
        <AriaButton className={styles.trigger}>
          <span className={styles.label}>{label}</span>
          <Icon name="chevron-down-12" className={styles.icon} />
        </AriaButton>
        {menu}
      </MenuTrigger>
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
