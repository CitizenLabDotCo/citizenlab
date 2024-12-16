import React, { useState } from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import useDeleteIdea from 'api/ideas/useDeleteIdea';

import WarningModal from 'components/WarningModal';
import modalMessages from 'components/WarningModal/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  postId: string;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

const ActionBarSingle = ({
  handleClickEdit,
  postId,
  resetSelection,
}: Props) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const { formatMessage } = useIntl();
  const { mutate: deleteIdea, isLoading: isLoadingDeleteIdea } =
    useDeleteIdea();

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const handleDelete = () => {
    deleteIdea(postId, {
      onSuccess: () => {
        resetSelection();
        closeWarningModal();
      },
    });
  };

  return (
    <>
      <Button
        buttonStyle="secondary-outlined"
        onClick={handleClickEdit}
        icon="edit"
        mr="8px"
        size="s"
        p="4px 8px"
        fontSize={`${fontSizes.s}px`}
      >
        <FormattedMessage {...messages.edit} />
      </Button>
      <Button
        buttonStyle="delete"
        onClick={openWarningModal}
        icon="delete"
        size="s"
        p="4px 8px"
        fontSize={`${fontSizes.s}px`}
      >
        <FormattedMessage {...messages.delete} />
      </Button>

      <WarningModal
        open={warningModalOpen}
        isLoading={isLoadingDeleteIdea}
        title={formatMessage(modalMessages.deleteInputTitle)}
        explanation={formatMessage(modalMessages.deleteInputExplanation)}
        onClose={closeWarningModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ActionBarSingle;
