import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { Button, Icon } from 'semantic-ui-react';
import messages from '../../messages';
import { ManagerType } from '../..';
import { useIntl } from 'utils/cl-intl';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

const ActionBarMulti = ({ selection, resetSelection, type }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: deleteInitiative } = useDeleteInitiative();
  const { mutate: deleteIdea } = useDeleteIdea();

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
        deleteInitiative({ initiativeId: id });
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
