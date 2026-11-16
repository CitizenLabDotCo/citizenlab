import React, { ReactNode } from 'react';

import { Button as AriaButton, MenuTrigger } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './FilterChip.module.css';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type TypeProps =
  // Chosen by the admin: removable.
  | { type?: 'applied'; onRemove: () => void }
  // Set by the system: no remove.
  | { type: 'default'; onRemove?: undefined };

export type FilterChipProps = TypeProps & {
  // Facet: value.
  label: ReactNode;
  // The design-system Menu that changes the value.
  menu: ReactNode;
};

const FilterChip = ({
  label,
  menu,
  type = 'applied',
  onRemove,
}: FilterChipProps) => {
  const { formatMessage } = useIntl();

  return (
    <span className={`${styles.chip} ${styles[type]}`}>
      <MenuTrigger>
        <AriaButton className={styles.trigger}>
          <span className={styles.label}>{label}</span>
          <Icon name="chevron-down-12" className={styles.icon} />
        </AriaButton>
        {menu}
      </MenuTrigger>
      {onRemove && (
        <AriaButton
          className={styles.remove}
          onPress={onRemove}
          aria-label={formatMessage(messages.removeFilter)}
        >
          <Icon name="x-14" className={styles.icon} />
        </AriaButton>
      )}
    </span>
  );
};

export default FilterChip;
