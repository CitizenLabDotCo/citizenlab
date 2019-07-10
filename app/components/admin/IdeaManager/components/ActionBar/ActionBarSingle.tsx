import React from 'react';
import { deleteIdea } from 'services/ideas';

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

  handleClickDelete = () => {
    const { postId, resetSelection, intl: { formatMessage } } = this.props;
    const message = formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message)) {
      deleteIdea(postId);
    }

    resetSelection();
  }

  handleClickEdit = () => {
    const { handleClickEdit } = this.props;
    handleClickEdit();
  }

  render() {
    const { type } = this.props;
    if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      return (
        <>
          <Button onClick={this.handleClickEdit}>
            <Icon name="edit" />
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button negative={true} basic={true} onClick={this.handleClickDelete}>
            <Icon name="trash" />
            <FormattedMessage {...messages.delete} />
          </Button>
        </>
      );
    } else {
      console.log('TODO ActionBarSingle');
    }
    return null;
  }
}

export default injectIntl<Props>(ActionBarSingle);
