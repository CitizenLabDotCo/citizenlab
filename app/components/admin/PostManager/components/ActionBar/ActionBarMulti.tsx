import React from 'react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { deleteIdea } from 'services/ideas';
import { Button, Icon } from 'semantic-ui-react';
import messages from '../../messages';
import { ManagerType } from '../..';

interface Props {
  type: ManagerType;
  postIds: string[];
  resetSelection: () => void;
}

class ActionBarMulti extends React.PureComponent<Props & InjectedIntlProps> {
  handleClickDeleteIdeas = () => {
    const { postIds, resetSelection, intl: { formatMessage } } = this.props;

      const message = formatMessage(messages.deleteIdeasConfirmation, { count: postIds.length });

      if (window.confirm(message)) {
        postIds.forEach((id) => {
          deleteIdea(id);
        });
      }

    resetSelection();
  }

  render() {
    const { type, postIds } = this.props;
    if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      return (
        <Button negative={true} basic={true} onClick={this.handleClickDeleteIdeas}>
          <Icon name="trash" />
          <FormattedMessage {...messages.deleteAllSelectedIdeas} values={{ count: postIds.length }} />
        </Button>
      );
    } else {
      console.log('TODO ActionBarMulti');
    }
    return null;
  }
}

export default injectIntl<Props>(ActionBarMulti);
