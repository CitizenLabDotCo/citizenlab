import React, { ReactNode, useId } from 'react';

import { Toolbar } from 'react-aria-components';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import IconButton from '../IconButton';

import messages from './messages';
import styles from './SelectionBar.module.css';
import '../tokens.css';

type SelectionBarProps = {
  count: number;
  // The batch actions: secondary Buttons, size 28, with a leading icon.
  children: ReactNode;
  onClearSelection: () => void;
};

const SelectionBar = ({
  count,
  children,
  onClearSelection,
}: SelectionBarProps) => {
  const { formatMessage } = useIntl();
  const countId = useId();

  return (
    <Toolbar className={styles.selectionBar} aria-labelledby={countId}>
      <span id={countId} className={styles.count}>
        <FormattedMessage {...messages.selected} values={{ count }} />
      </span>
      {children}
      <IconButton
        icon="x-16"
        aria-label={formatMessage(messages.clearSelection)}
        onPress={onClearSelection}
      />
    </Toolbar>
  );
};

export default SelectionBar;
