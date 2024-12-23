import React, { useState } from 'react';

import useDeleteIdea from 'api/ideas/useDeleteIdea';

import WarningModal from 'components/WarningModal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import DeleteButton from './DeleteButton';
import messages from './messages';

interface Props {
  /** A set of ids of ideas that are currently selected */
  selection: Set<string>;
  resetSelection: () => void;
}

const ActionBarMulti = ({ selection, resetSelection }: Props) => {
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [isLoadingDeleteIdea, setIsLoadingDeleteIdea] = useState(false);

  const { formatMessage } = useIntl();
  const { mutateAsync: deleteIdea } = useDeleteIdea();

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const handleDelete = async () => {
    setIsLoadingDeleteIdea(true);

    // Yes, terribly inefficient, but if you try to do this in
    // parallel the database crashes. To do this properly
    // we should add a bulk delete endpoint instead.
    for (const ideaId of selection) {
      await deleteIdea(ideaId);
    }

    resetSelection();
    setIsLoadingDeleteIdea(false);
    closeWarningModal();
  };

  const deleteMessage = messages.deleteAllSelectedInputs;

  return (
    <>
      <DeleteButton onClick={openWarningModal}>
        <FormattedMessage
          {...deleteMessage}
          values={{ count: selection.size }}
        />
      </DeleteButton>
      <WarningModal
        open={warningModalOpen}
        isLoading={isLoadingDeleteIdea}
        title={formatMessage(messages.deleteInputsTitle)}
        explanation={formatMessage(messages.deleteInputsExplanation)}
        onClose={closeWarningModal}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ActionBarMulti;
