import React, { ReactNode } from 'react';

import { Checkbox as AriaCheckbox } from 'react-aria-components';

import Icon from '../Icon';

import styles from './Checkbox.module.css';
import '../tokens.css';

type LabelProps =
  // Show label: the label sits right of the box.
  | { children: ReactNode; 'aria-label'?: string; slot?: undefined }
  // Without a label (a list row) the box needs an aria-label.
  | { children?: undefined; 'aria-label': string; slot?: undefined }
  // A table's selection box: the table wires it up and names it by its row.
  | { slot: 'selection'; children?: undefined; 'aria-label'?: string };

type CheckboxProps = LabelProps & {
  isSelected?: boolean;
  // Checked=Indeterminate: the dash of a select-all box when some rows are picked.
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  onChange?: (isSelected: boolean) => void;
  'data-cy'?: string;
};

const Checkbox = ({
  children,
  isSelected,
  isIndeterminate,
  isDisabled,
  onChange,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
  slot,
}: CheckboxProps) => (
  <AriaCheckbox
    className={styles.checkbox}
    isSelected={isSelected}
    isIndeterminate={isIndeterminate}
    isDisabled={isDisabled}
    onChange={onChange}
    aria-label={ariaLabel}
    data-cy={dataCy}
    slot={slot}
  >
    <span className={styles.box}>
      <Icon name="check-14" className={styles.tick} />
      <span className={styles.dash} />
    </span>
    {children && <span className={styles.label}>{children}</span>}
  </AriaCheckbox>
);

export default Checkbox;
