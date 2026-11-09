import React from 'react';

import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { useIntl } from 'utils/cl-intl';

import AddInputModal from '../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';

import messages from './messages';
import useInputTermLabels from './useInputTermLabels';

interface Props {
  ideaId: string;
  phaseId: string;
  onClose: () => void;
}

const EditInputModal = ({ ideaId, phaseId, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { term } = useInputTermLabels();
  const { data: idea, isPlaceholderData } = useIdeaById(ideaId);
  const { mutateAsync: updateIdea } = useUpdateIdea();

  if (!idea || isPlaceholderData) return null;

  return (
    <AddInputModal
      phaseId={phaseId}
      kind="input"
      header={formatMessage(messages.editTerm, { term })}
      submitLabel={formatMessage(messages.save)}
      defaultValues={{
        title_multiloc: idea.data.attributes.title_multiloc,
        author_id: idea.data.relationships.author?.data?.id ?? null,
        anonymous: idea.data.attributes.anonymous,
      }}
      onSubmit={(values) => updateIdea({ id: ideaId, requestBody: values })}
      onClose={onClose}
    />
  );
};

export default EditInputModal;
