import React from 'react';

import Icon from 'design-system/Icon';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './ReadyMark.module.css';

interface Props {
  ready: boolean;
}

const ReadyMark = ({ ready }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      {ready ? (
        <Icon name="circle-check-filled-16" className={styles.ready} />
      ) : (
        <Icon name="circle-dashed-1-16" className={styles.notReady} />
      )}
      <ScreenReaderOnly>
        {formatMessage(ready ? messages.itemReady : messages.itemNotReady)}
      </ScreenReaderOnly>
    </>
  );
};

export default ReadyMark;
