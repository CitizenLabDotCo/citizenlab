import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdeas } from 'api/ideas/types';

import ImportedInputRow from './ImportedInputRow';

interface Props {
  ideaId: string | null;
  ideas: IIdeas;
  onSelectIdea: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

const IdeaList = ({ ideaId, ideas, onSelectIdea, onDeleteIdea }: Props) => {
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);

  const handleDeleteIdea = (idToBeDeleted: string) => {
    setDeletingIdeaId(idToBeDeleted);
    onDeleteIdea(idToBeDeleted);
  };

  return (
    <Box paddingBottom="80px">
      {ideas.data.map((idea, i) => (
        <ImportedInputRow
          key={idea.id}
          idea={idea}
          ideaNumber={i + 1}
          selected={idea.id === ideaId}
          actionIcon="close"
          actionInProgress={deletingIdeaId === idea.id}
          onSelect={onSelectIdea}
          onAction={handleDeleteIdea}
        />
      ))}
    </Box>
  );
};

export default IdeaList;
