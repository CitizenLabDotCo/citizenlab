import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useApprovedImportedIdeas from 'api/import_ideas/useApprovedImportedIdeas';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import ImportedInputRow from './ImportedInputRow';
import messages from './messages';

interface Props {
  selectedIdeaId: string | null;
  onSelectIdea: (ideaId: string) => void;
}

const ApprovedInputsList = ({ selectedIdeaId, onSelectIdea }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/input-importer',
  });
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useApprovedImportedIdeas({ projectId, phaseId });
  const { mutateAsync: updateIdea } = useUpdateIdea();

  const ideas = data?.pages.flatMap((page) => page.data) ?? [];

  if (ideas.length === 0) {
    return (
      <Text m="0" p="12px" color="coolGrey600" fontSize="s">
        {formatMessage(messages.noApprovedInputsYet)}
      </Text>
    );
  }

  const handleUndo = async (id: string) => {
    setUndoingId(id);
    try {
      await updateIdea({ id, requestBody: { publication_status: 'draft' } });
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <Box paddingBottom="80px">
      {ideas.map((idea, i) => (
        <ImportedInputRow
          key={idea.id}
          idea={idea}
          ideaNumber={i + 1}
          selected={idea.id === selectedIdeaId}
          actionIcon="undo"
          actionInProgress={undoingId === idea.id}
          onSelect={onSelectIdea}
          onAction={handleUndo}
        />
      ))}
      {hasNextPage && (
        <Button
          buttonStyle="text"
          processing={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {formatMessage(messages.showMoreApprovedInputs)}
        </Button>
      )}
    </Box>
  );
};

export default ApprovedInputsList;
