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

class ActionBarSingle extends React.PureComponent<Props & InjectedIntlProps> {
  handleClickDeleteIdea = () => {
    const {
      postId,
      resetSelection,
      intl: { formatMessage },
    } = this.props;
    const message = formatMessage(messages.deleteInputConfirmation);

    if (window.confirm(message)) {
      deleteIdea(postId);
    }

    resetSelection();
  };
  handleClickDeleteInitiative = () => {
    const {
      postId,
      resetSelection,
      intl: { formatMessage },
    } = this.props;
    const message = formatMessage(messages.deleteInitiativeConfirmation);

    if (window.confirm(message)) {
      deleteInitiative(postId);
    }

    resetSelection();
  };

  render() {
    const { type, handleClickEdit } = this.props;
    if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      return (
        <>
          <Button onClick={handleClickEdit}>
            <Icon name="edit" />
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button
            negative={true}
            basic={true}
            onClick={this.handleClickDeleteIdea}
          >
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
            onClick={this.handleClickDeleteInitiative}
          >
            <Icon name="trash" />
            <FormattedMessage {...messages.delete} />
          </Button>
        </>
      );
    }
    return null;
  }
}

export default injectIntl<Props>(ActionBarSingle);
