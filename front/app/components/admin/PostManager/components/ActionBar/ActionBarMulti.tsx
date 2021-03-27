import React from 'react';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { deleteIdea } from 'services/ideas';
import { deleteInitiative } from 'services/initiatives';
import { Button, Icon } from 'semantic-ui-react';
import messages from '../../messages';
import { ManagerType } from '../..';

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

class ActionBarMulti extends React.PureComponent<Props & InjectedIntlProps> {
  handleClickDeleteIdeas = () => {
    const {
      selection,
      resetSelection,
      intl: { formatMessage },
    } = this.props;

    const message = formatMessage(messages.deleteInputsConfirmation, {
      count: selection.size,
    });

    if (window.confirm(message)) {
      selection.forEach((id) => {
        deleteIdea(id);
      });
    }

    resetSelection();
  };

  handleClickDeleteInitiatives = () => {
    const {
      selection,
      resetSelection,
      intl: { formatMessage },
    } = this.props;

    const message = formatMessage(messages.deleteInitiativesConfirmation, {
      count: selection.size,
    });

    if (window.confirm(message)) {
      selection.forEach((id) => {
        deleteInitiative(id);
      });
    }

    resetSelection();
  };

  render() {
    const { type, selection } = this.props;
    if (type === 'AllIdeas' || type === 'ProjectIdeas') {
      return (
        <Button
          negative={true}
          basic={true}
          onClick={this.handleClickDeleteIdeas}
        >
          <Icon name="trash" />
          <FormattedMessage
            {...messages.deleteAllSelectedInputs}
            values={{ count: selection.size }}
          />
        </Button>
      );
    } else if (type === 'Initiatives') {
      return (
        <Button
          negative={true}
          basic={true}
          onClick={this.handleClickDeleteInitiatives}
        >
          <Icon name="trash" />
          <FormattedMessage
            {...messages.deleteAllSelectedInitiatives}
            values={{ count: selection.size }}
          />
        </Button>
      );
    }
    return null;
  }
}

export default injectIntl<Props>(ActionBarMulti);
