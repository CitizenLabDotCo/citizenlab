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

const ActionBarMulti = ({
  type,
  selection,
  resetSelection,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
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
        onClick={handleClickDeleteInitiatives}
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
};

export default injectIntl(ActionBarMulti);
