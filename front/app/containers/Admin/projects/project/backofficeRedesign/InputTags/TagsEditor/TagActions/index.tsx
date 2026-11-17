import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

interface Props {
  deleteDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TagActions = ({ deleteDisabled, onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();
  const editLabel = formatMessage(topicsMessages.edit);
  const deleteLabel = formatMessage(topicsMessages.delete);

  return (
    <Box display="flex" alignItems="center" gap="6px" flexShrink={0}>
      <IconAction
        buttonStyle="bo-secondary"
        icon="edit"
        tooltip={editLabel}
        ariaLabel={editLabel}
        onClick={onEdit}
      />
      <IconAction
        buttonStyle="bo-secondary"
        icon="delete"
        tooltip={deleteLabel}
        ariaLabel={deleteLabel}
        disabled={deleteDisabled}
        onClick={onDelete}
      />
    </Box>
  );
};

export default TagActions;
