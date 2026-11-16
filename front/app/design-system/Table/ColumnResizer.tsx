import React from 'react';

import { ColumnResizer as AriaColumnResizer } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import '../tokens.css';

import styles from './ColumnResizer.module.css';
import messages from './messages';

// Sits on the right edge of a ColumnHeader; arrows resize it from the keyboard.
const ColumnResizer = () => {
  const { formatMessage } = useIntl();

  return (
    <AriaColumnResizer
      className={styles.resizer}
      aria-label={formatMessage(messages.resizeColumn)}
    />
  );
};

export default ColumnResizer;
