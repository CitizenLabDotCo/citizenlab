import React from 'react';

import { Button } from 'react-aria-components';

import Icon from '../Icon';

import styles from './TagGroup.module.css';
import '../tokens.css';

type TagAddProps = {
  children: string;
  'aria-describedby'?: string;
};

// Put it in a DialogTrigger: the trigger opens the tag picker.
const TagAdd = ({
  children,
  'aria-describedby': ariaDescribedBy,
}: TagAddProps) => (
  <Button className={styles.add} aria-describedby={ariaDescribedBy}>
    <svg className={styles.dash} aria-hidden focusable="false">
      <rect />
    </svg>
    <Icon name="plus-16" className={styles.addIcon} />
    {children}
  </Button>
);

export default TagAdd;
