import React from 'react';
import { deleteIdea } from 'services/ideas';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';
import { Icon, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { ManagerType } from '../..';
import { useIntl } from 'utils/cl-intl';

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
  const { formatMessage } = useIntl();
  const { mutate: deleteInitiative } = useDeleteInitiative();

  const handleClickDeleteIdea = () => {
    const message = formatMessage(messages.deleteInputConfirmation);

    if (window.confirm(message)) {
      deleteIdea(postId);
    }

    resetSelection();
  };

  const handleClickDeleteInitiative = () => {
    const message = formatMessage(messages.deleteInitiativeConfirmation);

    if (window.confirm(message)) {
      deleteInitiative(
        { initiativeId: postId },
        {
          onSuccess: () => {
            resetSelection();
          },
        }
      );
    }
  };

  if (type === 'AllIdeas' || type === 'ProjectIdeas') {
    return (
      <>
        <Button onClick={handleClickEdit}>
          <Icon name="edit" />
          <FormattedMessage {...messages.edit} />
        </Button>
        <Button negative={true} basic={true} onClick={handleClickDeleteIdea}>
          <Icon name="delete" />
          <FormattedMessage {...messages.delete} />
        </Button>
      </>
    );
  } else if (type === 'Initiatives') {
    return (
      <>
        <Button onClick={handleClickEdit}>
          <Icon name="edit" />
          <FormattedMessage {...messages.edit} />
        </Button>
        <Button
          negative={true}
          basic={true}
          onClick={handleClickDeleteInitiative}
        >
          <Icon name="delete" />
          <FormattedMessage {...messages.delete} />
        </Button>
      </>
    );
  }
  return null;
};

export default ActionBarSingle;
