import React, { ReactNode } from 'react';

import { MenuTrigger } from 'react-aria-components';

import { FormattedMessage } from 'utils/cl-intl';

import Button from '../Button';

import styles from './FilterBar.module.css';
import messages from './messages';
import '../tokens.css';

export { default as FilterChip } from './FilterChip';

type FilterBarProps = {
  // FilterChips.
  children?: ReactNode;
  // The design-system Menu that Add filter opens.
  addFilterMenu: ReactNode;
  // The result count, e.g. "24 projects".
  count: ReactNode;
  onClear: () => void;
};

const FilterBar = ({
  children,
  addFilterMenu,
  count,
  onClear,
}: FilterBarProps) => (
  <div className={styles.filterBar}>
    {children}
    <MenuTrigger>
      <Button variant="quiet" size={28} icon="plus-16">
        <FormattedMessage {...messages.addFilter} />
      </Button>
      {addFilterMenu}
    </MenuTrigger>
    <span className={styles.spacer} />
    <span className={styles.count}>{count}</span>
    <Button variant="quiet" size={28} onPress={onClear}>
      <FormattedMessage {...messages.clear} />
    </Button>
  </div>
);

export default FilterBar;
