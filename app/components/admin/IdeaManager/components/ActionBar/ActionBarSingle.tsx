import React from 'react';
import { deleteIdea } from 'services/ideas';

import { Icon, Button } from 'semantic-ui-react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

interface Props {
  ideaId: string;
  resetSelectedIdeas: () => void;
  handleClickEdit: (ideaId: string) => void;
}

class ActionBarSingle extends React.PureComponent<Props & InjectedIntlProps> {

  handleClickDelete = () => {
    const { ideaId, resetSelectedIdeas } = this.props;
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message)) {
      deleteIdea(ideaId);
    }

    resetSelectedIdeas();
  }

  handleClickEdit = () => {
    const { ideaId, handleClickEdit } = this.props;
    handleClickEdit(ideaId);
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
