import React, { ReactNode } from 'react';

import { Checkbox as AriaCheckbox } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './Checkbox.module.css';

type LabelProps =
  // Show label: the label sits right of the box.
  | { children: ReactNode; 'aria-label'?: string }
  // Without a label (a list row) the box needs an aria-label.
  | { children?: undefined; 'aria-label': string };

export type CheckboxProps = LabelProps & {
  isSelected?: boolean;
  defaultSelected?: boolean;
  // Checked=Indeterminate: the dash of a select-all box when some rows are picked.
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onChange?: (isSelected: boolean) => void;
  value?: string;
  name?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const Checkbox = ({
  children,
  isSelected,
  defaultSelected,
  isIndeterminate,
  isDisabled,
  isInvalid,
  isReadOnly,
  isRequired,
  onChange,
  value,
  name,
  autoFocus,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: CheckboxProps) => (
  <AriaCheckbox
    className={styles.checkbox}
    isSelected={isSelected}
    defaultSelected={defaultSelected}
    isIndeterminate={isIndeterminate}
    isDisabled={isDisabled}
    isInvalid={isInvalid}
    isReadOnly={isReadOnly}
    isRequired={isRequired}
    onChange={onChange}
    value={value}
    name={name}
    autoFocus={autoFocus}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    <span className={styles.box}>
      <Icon name="check-14" className={styles.tick} />
      <span className={styles.dash} />
    </span>
    {children && <span className={styles.label}>{children}</span>}
  </AriaCheckbox>
);

export default Checkbox;
