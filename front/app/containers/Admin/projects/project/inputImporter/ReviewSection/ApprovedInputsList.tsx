import React, { useState } from 'react';

import {
  Box,
  Button,
  CollapsibleContainer,
  Text,
  IconButton,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useApprovedImportedIdeas from 'api/import_ideas/useApprovedImportedIdeas';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';
import { truncate } from 'utils/textUtils';

import messages from './messages';

// Drive overflow from the CollapsibleContainer's aria-expanded so the
// scrollbar disappears the instant the user clicks to collapse, instead of
// waiting for CollapsibleContainer's 1500ms unmount timeout.
const Wrapper = styled(Box)`
  overflow: hidden;
  &:has(button[aria-expanded='true']) {
    overflow-y: auto;
  }
`;

interface Props {
  selectedIdeaId: string | null;
  onSelectIdea: (ideaId: string) => void;
}

const ApprovedInputsList = ({ selectedIdeaId, onSelectIdea }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/input-importer',
  });
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useApprovedImportedIdeas({ projectId, phaseId });
  const { mutateAsync: updateIdea } = useUpdateIdea();

  const ideas = data?.pages.flatMap((page) => page.data) ?? [];
  if (ideas.length === 0) return null;

  const handleUndo = async (id: string) => {
    setUndoingId(id);
    try {
      await updateIdea({ id, requestBody: { publication_status: 'draft' } });
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <Wrapper
      bgColor={colors.white}
      borderTop={`1px ${colors.grey400} solid`}
      py="8px"
      maxHeight="50%"
      flexShrink={0}
    >
      <CollapsibleContainer
        titleAs="h3"
        titleVariant="h5"
        titleFontSize="s"
        title={formatMessage(messages.approvedInputsTitle)}
      >
        <Box>
          {ideas.map((idea) => {
            const title = localize(idea.attributes.title_multiloc);

            return (
              <Box
                key={idea.id}
                py="8px"
                borderBottom={`1px ${colors.grey400} solid`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="8px"
                bgColor={
                  idea.id === selectedIdeaId ? colors.grey200 : undefined
                }
              >
                <Box
                  as="button"
                  flex="1"
                  p="0"
                  border="none"
                  bgColor="transparent"
                  style={{ cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => onSelectIdea(idea.id)}
                >
                  <Text as="span" m="0" color="black" fontSize="s">
                    {title
                      ? truncate(title, 80)
                      : formatMessage(messages.noTitleInputLabel)}
                  </Text>
                </Box>
                {undoingId === idea.id ? (
                  <Box
                    py="3px"
                    px="6px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Spinner size="20px" />
                  </Box>
                ) : (
                  <IconButton
                    iconName="undo"
                    iconColor={colors.primary}
                    iconColorOnHover={colors.black}
                    onClick={() => handleUndo(idea.id)}
                    a11y_buttonActionMessage={formatMessage(
                      messages.undoApproval
                    )}
                  />
                )}
              </Box>
            );
          })}
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
      </CollapsibleContainer>
    </Wrapper>
  );
};

export default ApprovedInputsList;
