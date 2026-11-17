import React from 'react';

import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';

import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import styles from './CausesSection.module.css';
import messages from './messages';

interface Props {
  title: Multiloc;
  imageUrl: string | null | undefined;
  volunteersCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const CauseRow = ({
  title,
  imageUrl,
  volunteersCount,
  onEdit,
  onDelete,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <li className={styles.row}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className={styles.thumbnail} />
      ) : (
        <div className={styles.placeholder} />
      )}
      <div className={styles.text}>
        <span className={styles.title}>{localize(title)}</span>
        <span className={styles.meta}>
          {formatMessage(messages.nSignedUp, { count: volunteersCount })}
        </span>
      </div>
      <div className={styles.rowActions}>
        <IconButton
          icon="pencil-14"
          aria-label={formatMessage(volunteeringMessages.editCauseTitle)}
          onPress={onEdit}
        />
        <IconButton
          icon="trash-2-16"
          aria-label={formatMessage(messages.deleteCause)}
          onPress={onDelete}
        />
      </div>
    </li>
  );
};

export default CauseRow;
