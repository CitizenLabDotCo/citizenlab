import React, { ReactNode } from 'react';

import { Popover } from 'react-aria-components';

import surfaces from '../surfaces.module.css';

import styles from './ListBox.module.css';
import '../tokens.css';

type Props = {
  // A ListBox.
  children: ReactNode;
};

// The popover of Select and ComboBox: 240 wide, 4 px under the trigger.
const ListBoxPopover = ({ children }: Props) => (
  <Popover
    placement="bottom start"
    offset={4}
    className={`${surfaces.dropdown} ${styles.popover}`}
  >
    {children}
  </Popover>
);

export default ListBoxPopover;
