import React, { useState } from 'react';

import { Icon, Button } from 'semantic-ui-react';

import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

import WarningModal from 'components/WarningModal';
import modalMessages from 'components/WarningModal/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { ManagerType } from '../..';

import messages from './messages';

interface Props {
  type: ManagerType;
  postId: string;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

const ActionBarSingle = ({
  type,
  handleClickEdit,
  postId,
  resetSelection,
}: Props) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const { formatMessage } = useIntl();
  const { mutate: deleteIdea, isLoading: isLoadingDeleteIdea } =
    useDeleteIdea();
  const { mutate: deleteInitiative, isLoading: isLoadingDeleteInitiative } =
    useDeleteInitiative();

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const handleDelete = () => {
    if (type === 'Initiatives') {
      deleteInitiative(
        { initiativeId: postId },
        {
          onSuccess: () => {
            resetSelection();
            closeWarningModal();
          },
        }
      );
    } else {
      deleteIdea(postId, {
        onSuccess: () => {
          resetSelection();
          closeWarningModal();
        },
      });
    }
  };

  return (
    <>
      <Button onClick={handleClickEdit}>
        <Icon name="edit" />
        <FormattedMessage {...messages.edit} />
      </Button>
      <Button negative={true} basic={true} onClick={openWarningModal}>
        <Icon name="delete" />
        <FormattedMessage {...messages.delete} />
      </Button>

      <WarningModal
        open={warningModalOpen}
        isLoading={isLoadingDeleteIdea || isLoadingDeleteInitiative}
        title={
          type === 'Initiatives'
            ? formatMessage(modalMessages.deleteInitiativeTitle)
            : formatMessage(modalMessages.deleteInputTitle)
        }
        explanation={
          type === 'Initiatives'
            ? formatMessage(modalMessages.deleteInitiativeExplanation)
            : formatMessage(modalMessages.deleteInputExplanation)
        }
        onClose={closeWarningModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ActionBarSingle;
