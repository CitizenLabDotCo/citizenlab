import React from 'react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { deleteIdea } from 'services/ideas';
import { Button, Icon } from 'semantic-ui-react';
import messages from '../../messages';

interface Props {
  ideaIds: string[];
  resetSelectedIdeas: () => void;
}

class ActionBarMulti extends React.PureComponent<Props & InjectedIntlProps> {
  handleClickDelete = () => {
    const { ideaIds, resetSelectedIdeas } = this.props;

    const message = this.props.intl.formatMessage(messages.deleteIdeasConfirmation, { count: this.props.ideaIds.length });

    if (window.confirm(message)) {
      ideaIds.forEach((id) => {
        deleteIdea(id);
      });
    }

    resetSelectedIdeas();
  }

  render() {
    const { ideaIds } = this.props;
    return (
      <Button negative={true} basic={true} onClick={this.handleClickDelete}>
        <Icon name="trash" />
        <FormattedMessage {...messages.deleteAllSelectedIdeas} values={{ count: ideaIds.length }} />
      </Button>
    );
  }
}

export default injectIntl<Props>(ActionBarMulti);
