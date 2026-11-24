import React from 'react';

import { Multiloc } from 'typings';

import IconButton from 'design-system/IconButton';
import Text from 'design-system/Text';

import useLocalize from 'hooks/useLocalize';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';

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
        <Text as="span" variant="ui" tone="primary">
          {localize(title)}
        </Text>
        <Text as="span" variant="small" tone="secondary">
          {formatMessage(messages.nSignedUp, { count: volunteersCount })}
        </Text>
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
