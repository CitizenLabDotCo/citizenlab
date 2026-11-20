import React from 'react';

import Icon from 'design-system/Icon';

import { useIntl } from 'utils/cl-intl';

import styles from './AdminOnlyPlaceholder.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  title: string;
}

const AdminOnlyPlaceholder = ({ title }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.placeholder}>
      <p className={styles.title}>{title}</p>
      <div className={styles.note}>
        <Icon name="eye-off-16" className={styles.icon} />
        <p className={styles.noteText}>
          {formatMessage(messages.onlyAdminsSeeThis)}
        </p>
      </div>
    </div>
  );
};

export default AdminOnlyPlaceholder;
