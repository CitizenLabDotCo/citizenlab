import React from 'react';

import { Button } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './TagGroup.module.css';

type TagAddProps = {
  children: string;
};

// Put it in a DialogTrigger: the trigger opens the tag picker.
const TagAdd = ({ children }: TagAddProps) => (
  <Button className={styles.add}>
    <svg className={styles.dash} aria-hidden focusable="false">
      <rect />
    </svg>
    <Icon name="plus-16" className={styles.addIcon} />
    {children}
  </Button>
);

export default TagAdd;
