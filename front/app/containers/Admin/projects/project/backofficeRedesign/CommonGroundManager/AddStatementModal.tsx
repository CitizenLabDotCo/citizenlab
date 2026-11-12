import React from 'react';

import useAddIdea from 'api/ideas/useAddIdea';

import AddInputModal from '../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';

interface Props {
  phaseId: string;
  onSaved: () => void;
  onClose: () => void;
}

const AddStatementModal = ({ phaseId, onSaved, onClose }: Props) => {
  const { mutateAsync: addIdea } = useAddIdea();

  return (
    <AddInputModal
      phaseId={phaseId}
      kind="statement"
      onSubmit={(values) =>
        addIdea({
          phaseId,
          requestBody: { ...values, publication_status: 'published' },
        }).then(onSaved)
      }
      onClose={onClose}
    />
  );
};

export default AddStatementModal;
