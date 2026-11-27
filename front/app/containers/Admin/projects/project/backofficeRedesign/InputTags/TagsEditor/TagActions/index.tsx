import React from 'react';

import IconButton from 'design-system/IconButton';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { useIntl } from 'utils/cl-intl';

import 'design-system/tokens.css';

interface Props {
  deleteDisabledReason?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const TagActions = ({ deleteDisabledReason, onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
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
        disabledReason={deleteDisabledReason}
        onPress={onDelete}
      />
    </>
  );
};

export default TagActions;
