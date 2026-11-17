import React from 'react';

import { Button } from 'react-aria-components';

import styles from './IdeaTable.module.css';
import 'design-system/tokens.css';

interface Props {
  title: string;
  onOpen: () => void;
}

// The row's title as a button, for rows that don't open on their own.
// React Aria stops the press here, so a row action doesn't run twice.
const RowTitleButton = ({ title, onOpen }: Props) => (
  <Button className={styles.titleButton} onPress={onOpen}>
    {title}
  </Button>
);

export default RowTitleButton;
