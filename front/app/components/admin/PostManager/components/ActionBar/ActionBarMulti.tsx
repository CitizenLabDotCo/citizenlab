import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Button, Icon } from 'semantic-ui-react';
import { deleteIdea } from 'services/ideas';
import { deleteInitiative } from 'services/initiatives';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { ManagerType } from '../..';
import messages from '../../messages';

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

const ActionBarMulti = ({
  type,
  selection,
  resetSelection,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const handleClickDeleteIdeas = () => {
    if (
      window.confirm(
        formatMessage(messages.deleteInputsConfirmation, {
          count: selection.size,
        })
      )
    ) {
      selection.forEach((id) => {
        deleteIdea(id);
      });
    }

    resetSelection();
  };

  const handleClickDeleteInitiatives = () => {
    if (
      window.confirm(
        formatMessage(messages.deleteInitiativesConfirmation, {
          count: selection.size,
        })
      )
    ) {
      selection.forEach((id) => {
        deleteInitiative(id);
      });
    }

    resetSelection();
  };

  if (type === 'AllIdeas' || type === 'ProjectIdeas') {
    return (
      <Button negative={true} basic={true} onClick={handleClickDeleteIdeas}>
        <Icon name="delete" />
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
        onClick={handleClickDeleteInitiatives}
      >
        <Icon name="delete" />
        <FormattedMessage
          {...messages.deleteAllSelectedInitiatives}
          values={{ count: selection.size }}
        />
      </Button>
    );
  }
  return null;
};

export default injectIntl(ActionBarMulti);
