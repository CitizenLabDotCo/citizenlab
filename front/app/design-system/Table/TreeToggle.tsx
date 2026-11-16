import React from 'react';

import { Button as AriaButton } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './TreeToggle.module.css';

type Props = {
  isExpanded: boolean;
};

// The Row's chevron slot: React Aria wires the press and names it Expand or Collapse.
const TreeToggle = ({ isExpanded }: Props) => (
  <AriaButton
    slot="chevron"
    className={styles.toggle}
    data-expanded={isExpanded || undefined}
  >
    <Icon name="triangle-right-8" className={styles.icon} />
  </AriaButton>
);

export default TreeToggle;
