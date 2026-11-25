import React from 'react';

import { useIntl } from 'utils/cl-intl';

import IconButton from '../IconButton';
import { SpinnerGraphic } from '../Spinner';

import styles from './ActionStatus.module.css';
import messages from './messages';
import '../tokens.css';

export type ActionStatusState = 'busy' | 'done' | 'failed';

type Props = {
  state: ActionStatusState;
  message: string;
  onDismiss: () => void;
};

// Takes the place of a selection bar while a batch action runs and right
// after it ends, so the result is read where the action was started.
const ActionStatus = ({ state, message, onDismiss }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div
      className={`${styles.actionStatus} ${styles[state]}`}
      role={state === 'failed' ? 'alert' : 'status'}
    >
      {state === 'busy' && <SpinnerGraphic />}
      <span className={styles.message}>{message}</span>
      {state !== 'busy' && (
        <IconButton
          icon="x-16"
          aria-label={formatMessage(messages.dismiss)}
          onPress={onDismiss}
        />
      )}
    </div>
  );
};

export default ActionStatus;
