import React from 'react';

import IconButton from 'design-system/IconButton';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './TagActions.module.css';
import 'design-system/tokens.css';

interface Props {
  className: string;
  deleteDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TagActions = ({ className, deleteDisabled, onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={`${styles.actions} ${className}`}>
      <IconButton
        size={24}
        icon="square-pen-16"
        aria-label={formatMessage(topicsMessages.edit)}
        onPress={onEdit}
      />
      <IconButton
        size={24}
        icon="trash-2-16"
        aria-label={formatMessage(topicsMessages.delete)}
        isDisabled={deleteDisabled}
        onPress={onDelete}
      />
    </div>
  );
};

export default TagActions;
