import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { useIntl } from 'utils/cl-intl';

import TagActionButton from './TagActionButton';

interface Props {
  deleteDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const TagActions = ({ deleteDisabled, onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" alignItems="center" gap="6px" flexShrink={0}>
      <TagActionButton
        iconName="edit"
        label={formatMessage(topicsMessages.edit)}
        onClick={onEdit}
      />
      <TagActionButton
        iconName="delete"
        label={formatMessage(topicsMessages.delete)}
        disabled={deleteDisabled}
        onClick={onDelete}
      />
    </Box>
  );
};

export default TagActions;
