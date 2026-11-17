import React, { ReactNode } from 'react';

import { MenuTrigger } from 'react-aria-components';

import Button from '../Button';
import '../tokens.css';

import styles from './FilterBar.module.css';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
