import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { useIntl } from 'utils/cl-intl';

import AddInputModal from '../Phase/BuildPanel/BuildFields/MethodSection/AddInputModal';

import messages from './messages';

interface Props {
  idea: IIdeaData;
  phaseId: string;
  onSaved: () => void;
  onClose: () => void;
}

const EditStatementModal = ({ idea, phaseId, onSaved, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: updateIdea } = useUpdateIdea();

  return (
    <AddInputModal
      phaseId={phaseId}
      kind="statement"
      header={formatMessage(messages.editStatement)}
      submitLabel={formatMessage(messages.saveStatement)}
      defaultValues={{
        title_multiloc: idea.attributes.title_multiloc,
        // Left out, not null, without an author: the API reads null as
        // removing the author.
        author_id: idea.relationships.author?.data?.id,
        anonymous: idea.attributes.anonymous,
      }}
      onSubmit={(values) =>
        updateIdea({ id: idea.id, requestBody: values }).then(onSaved)
      }
      onClose={onClose}
    />
  );
};

export default EditStatementModal;
