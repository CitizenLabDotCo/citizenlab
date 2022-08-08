import React from 'react';
import { deleteIdea } from 'services/ideas';
import { deleteInitiative } from 'services/initiatives';

import { Icon, Button } from 'semantic-ui-react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { ManagerType } from '../..';

interface Props {
  type: ManagerType;
  postId: string;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

const ActionBarSingle = ({
  postId,
  resetSelection,
  handleClickEdit,
  type,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleClickDeleteIdea = () => {
    if (window.confirm(formatMessage(messages.deleteInputConfirmation))) {
      deleteIdea(postId);
    }

    resetSelection();
  };

  const handleClickDeleteInitiative = () => {
    if (window.confirm(formatMessage(messages.deleteInitiativeConfirmation))) {
      deleteInitiative(postId);
    }

    resetSelection();
  };

  if (type === 'AllIdeas' || type === 'ProjectIdeas') {
    return (
      <>
        <Button onClick={handleClickEdit}>
          <Icon name="edit" />
          <FormattedMessage {...messages.edit} />
        </Button>
        <Button negative={true} basic={true} onClick={handleClickDeleteIdea}>
          <Icon name="trash" />
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
          <Icon name="trash" />
          <FormattedMessage {...messages.delete} />
        </Button>
      </>
    );
  }

  return null;
};

export default injectIntl(ActionBarSingle);
