import React, { ReactNode } from 'react';

import { MenuItem } from 'react-aria-components';

import { SwitchTrack } from '../Switch';
import '../tokens.css';

import styles from './SwitchRow.module.css';

export type SwitchRowProps = {
  id: string;
  children: ReactNode;
  // Needed when children is not plain text, for typeahead.
  textValue?: string;
  isDisabled?: boolean;
  'data-cy'?: string;
};

// A MenuItem of a Menu with selectionMode="multiple"; the Menu owns the selection.
const SwitchRow = ({
  id,
  children,
  textValue,
  isDisabled,
  'data-cy': dataCy,
}: SwitchRowProps) => (
  <MenuItem
    className={styles.row}
    id={id}
    textValue={textValue}
    isDisabled={isDisabled}
    data-cy={dataCy}
  >
    {({ isSelected, isDisabled }) => (
      <>
        <span className={styles.label}>{children}</span>
        <SwitchTrack
          size={28}
          isSelected={isSelected}
          isDisabled={isDisabled}
        />
      </>
    )}
  </MenuItem>
);

export { default as PopoverSwitchRow } from './PopoverSwitchRow';
export type { PopoverSwitchRowProps } from './PopoverSwitchRow';

export default SwitchRow;
