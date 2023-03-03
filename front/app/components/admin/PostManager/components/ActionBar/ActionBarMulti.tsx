import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { deleteIdea } from 'services/ideas';
import { deleteInitiative } from 'services/initiatives';
import { Button, Icon } from 'semantic-ui-react';
import messages from '../../messages';
import { ManagerType } from '../..';
import { useIntl } from 'utils/cl-intl';

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

const ActionBarMulti = ({
  selection,
  resetSelection,
  type,
}: Props & WrappedComponentProps) => {
  const { formatMessage } = useIntl();

  const handleClickDeleteIdeas = () => {
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

  const handleClickDeleteInitiatives = () => {
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

export default ActionBarMulti;
