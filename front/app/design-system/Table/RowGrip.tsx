import React from 'react';

import { Button as AriaButton, useTableOptions } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './Row.module.css';

// The Row's drag slot; it only exists when the Table has drag and drop.
const RowGrip = () => {
  const { formatMessage } = useIntl();
  // Null while React Aria builds the collection, before the Table provides it.
  const options: ReturnType<typeof useTableOptions> | null = useTableOptions();

  if (!options?.allowsDragging) return null;

  return (
    <AriaButton
      slot="drag"
      className={styles.grip}
      aria-label={formatMessage(messages.dragRow)}
    >
      <Icon name="grip-vertical-12" className={styles.gripIcon} />
    </AriaButton>
  );
};

export default RowGrip;
