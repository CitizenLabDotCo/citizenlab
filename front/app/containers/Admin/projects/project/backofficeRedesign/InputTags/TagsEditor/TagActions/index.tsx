import React from 'react';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import IconButton from 'design-system/IconButton';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import styles from './TagActions.module.css';

interface Props {
  deleteDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TagActions = ({ deleteDisabled, onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.actions}>
      <IconButton
        variant="bordered"
        icon="pencil-14"
        aria-label={formatMessage(topicsMessages.edit)}
        onPress={onEdit}
      />
      <IconButton
        variant="bordered"
        icon="trash-2-16"
        aria-label={formatMessage(topicsMessages.delete)}
        isDisabled={deleteDisabled}
        onPress={onDelete}
      />
    </div>
  );
};

export default TagActions;
