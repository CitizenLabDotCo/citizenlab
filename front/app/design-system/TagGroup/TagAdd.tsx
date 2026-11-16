import React from 'react';

import { Button, PressEvent } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './TagGroup.module.css';

export type TagAddProps = {
  children: string;
  isDisabled?: boolean;
  // Not needed inside a DialogTrigger: the trigger opens the tag picker.
  onPress?: (e: PressEvent) => void;
  'data-cy'?: string;
};

const TagAdd = ({
  children,
  isDisabled = false,
  onPress,
  'data-cy': dataCy,
}: TagAddProps) => (
  <Button
    className={styles.add}
    isDisabled={isDisabled}
    onPress={onPress}
    data-cy={dataCy}
  >
    <svg className={styles.dash} aria-hidden focusable="false">
      <rect />
    </svg>
    <Icon name="plus-16" className={styles.addIcon} />
    {children}
  </Button>
);

export default TagAdd;
