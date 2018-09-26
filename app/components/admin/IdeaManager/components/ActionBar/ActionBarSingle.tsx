import React from 'react';
import { deleteIdea } from 'services/ideas';
import clHistory from 'utils/cl-router/history';

import { Icon, Button } from 'semantic-ui-react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

interface Props {
  ideaId: string;
}

class ActionBarSingle extends React.PureComponent<Props & InjectedIntlProps> {

  handleClickDelete = () => {
    const { ideaId } = this.props;
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message)) {
      deleteIdea(ideaId);
    }
  }

  handleClickEdit = () => {
    const { ideaId } = this.props;
    clHistory.push(`/ideas/edit/${ideaId}`);
  }

  render() {
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
  }
}

export default injectIntl<Props>(ActionBarSingle);
