import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Icon, Button } from 'semantic-ui-react';
import { deleteIdea } from 'services/ideas';
import { deleteInitiative } from 'services/initiatives';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { ManagerType } from '../..';
import messages from '../../messages';

interface Props {
  type: ManagerType;
  postId: string;
  resetSelection: () => void;
  handleClickEdit: () => void;
}

class ActionBarSingle extends React.PureComponent<
  Props & WrappedComponentProps
> {
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
            onClick={this.handleClickDeleteInitiative}
          >
            <Icon name="delete" />
            <FormattedMessage {...messages.delete} />
          </Button>
        </>
      );
    }
    return null;
  }
}

export default injectIntl(ActionBarSingle);
