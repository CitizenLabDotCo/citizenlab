import React, { useState } from 'react';

// api
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

// components
import { Icon, Button } from 'semantic-ui-react';
import WarningModal from 'components/WarningModal';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { ManagerType } from '../..';

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
            ? formatMessage(messages.deleteInitiativeTitle)
            : formatMessage(messages.deleteInputTitle)
        }
        explanation={
          type === 'Initiatives'
            ? formatMessage(messages.deleteInitiativeExplanation)
            : formatMessage(messages.deleteInputExplanation)
        }
        onClose={closeWarningModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ActionBarSingle;
