import React, { useState } from 'react';

// api
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

// components
import { Button, Icon } from 'semantic-ui-react';
import WarningModal from 'components/WarningModal';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { ManagerType } from '../..';

interface Props {
  type: ManagerType;
  /** A set of ids of ideas/initiatives that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

const ActionBarMulti = ({ selection, resetSelection, type }: Props) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [isLoadingDeleteIdea, setIsLoadingDeleteIdea] = useState(false);
  const [isLoadingDeleteInitiative, setIsLoadingDeleteInitiative] =
    useState(false);

  const { formatMessage } = useIntl();
  const { mutateAsync: deleteIdea } = useDeleteIdea();
  const { mutateAsync: deleteInitiative } = useDeleteInitiative();

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const handleDelete = async () => {
    if (type === 'Initiatives') {
      setIsLoadingDeleteInitiative(true);
      resetSelection();

      // Yes, terribly inefficient, but if you try to do this in
      // parallel the database crashes. To do this properly
      // we should add a bulk delete endpoint instead.
      for (const initiativeId of selection) {
        await deleteInitiative({ initiativeId });
      }

      setIsLoadingDeleteInitiative(false);
      closeWarningModal();
    } else {
      setIsLoadingDeleteIdea(true);
      resetSelection();

      // Yes, terribly inefficient, but if you try to do this in
      // parallel the database crashes. To do this properly
      // we should add a bulk delete endpoint instead.
      for (const ideaId of selection) {
        await deleteIdea(ideaId);
      }

      setIsLoadingDeleteIdea(false);
      closeWarningModal();
    }
  };

  const deleteMessage =
    type === 'Initiatives'
      ? messages.deleteAllSelectedInitiatives
      : messages.deleteAllSelectedInputs;

  return (
    <>
      <Button negative={true} basic={true} onClick={openWarningModal}>
        <Icon name="delete" />
        <FormattedMessage
          {...deleteMessage}
          values={{ count: selection.size }}
        />
      </Button>
      <WarningModal
        open={warningModalOpen}
        isLoading={isLoadingDeleteIdea || isLoadingDeleteInitiative}
        title={
          type === 'Initiatives'
            ? formatMessage(messages.deleteInitiativesTitle)
            : formatMessage(messages.deleteInputsTitle)
        }
        explanation={
          type === 'Initiatives'
            ? formatMessage(messages.deleteInitiativesExplanation)
            : formatMessage(messages.deleteInputsExplanation)
        }
        onClose={closeWarningModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ActionBarMulti;
