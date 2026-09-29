import React, { useState } from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import WarningModal from 'components/WarningModal';
import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import ToolbarIconButton from '../ToolbarIconButton';

interface Props {
  idea: IIdeaData;
  onEdit: () => void;
  onDeleted: () => void;
}

const QuickActions = ({ idea, onEdit, onDeleted }: Props) => {
  const { formatMessage } = useIntl();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { mutate: deleteIdea, isPending } = useDeleteIdea();

  const handleDelete = () =>
    deleteIdea(idea.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        onDeleted();
      },
    });

  return (
    <Box display="flex" gap="6px">
      <ToolbarIconButton
        icon="edit"
        label={formatMessage(messages.edit)}
        onClick={onEdit}
      />
      <Tooltip content={formatMessage(messages.viewOnSite)} theme="dark">
        <Box>
          <ButtonWithLink
            to="/ideas/$slug"
            params={{ slug: idea.attributes.slug }}
            // A new tab keeps the manager's filters and selection as they are.
            openLinkInNewTab
            buttonStyle="secondary-outlined"
            icon="eye"
            iconSize="18px"
            padding="6px"
            ariaLabel={formatMessage(messages.viewOnSite)}
          />
        </Box>
      </Tooltip>
      <ToolbarIconButton
        icon="delete"
        label={formatMessage(messages.delete)}
        onClick={() => setDeleteModalOpen(true)}
      />
      <WarningModal
        open={deleteModalOpen}
        isLoading={isPending}
        title={formatMessage(warningModalMessages.deleteInputTitle)}
        explanation={formatMessage(warningModalMessages.deleteInputExplanation)}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default QuickActions;
