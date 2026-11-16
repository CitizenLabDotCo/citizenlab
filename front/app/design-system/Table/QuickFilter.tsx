import React from 'react';

import { ToggleButton as AriaToggleButton } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './QuickFilter.module.css';

export type QuickFilterProps = {
  // E.g. Pending approval.
  label: string;
  count?: number;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  'data-cy'?: string;
};

// One-click filter pill. Red means it needs your action; on, it shows an × and a second press turns it off.
const QuickFilter = ({
  label,
  count,
  isSelected,
  defaultSelected,
  onChange,
  'data-cy': dataCy,
}: QuickFilterProps) => (
  <AriaToggleButton
    className={styles.quickFilter}
    isSelected={isSelected}
    defaultSelected={defaultSelected}
    onChange={onChange}
    data-cy={dataCy}
  >
    {({ isSelected: selected }) => (
      <>
        <span className={styles.dot} aria-hidden />
        <span className={styles.label}>{label}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
        {selected && (
          <span className={styles.remove}>
            <Icon name="x-14" className={styles.removeIcon} />
          </span>
        )}
      </>
    )}
  </AriaToggleButton>
);

export default QuickFilter;
