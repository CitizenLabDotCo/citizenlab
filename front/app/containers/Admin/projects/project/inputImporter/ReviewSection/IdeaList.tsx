import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { IIdeaData, IIdeas } from 'api/ideas/types';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';

import { useIntl } from 'utils/cl-intl';
import { truncate } from 'utils/textUtils';

import messages from './messages';

const StyledButton = styled(Button)``;

const StyledBox = styled(Box)`
  ${StyledButton} {
    display: none;
  }

  &:hover {
    background-color: ${colors.teal50};

    ${StyledButton} {
      display: block;
    }
  }
`;

interface Props {
  ideaId: string | null;
  ideas: IIdeas;
  onSelectIdea: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

const IdeaList = ({ ideaId, ideas, onSelectIdea, onDeleteIdea }: Props) => {
  return (
    <Box paddingBottom="80px">
      {ideas.data.map((idea, i) => (
        <Idea
          key={idea.id}
          ideaId={ideaId}
          idea={idea}
          ideaNumber={i + 1}
          onSelectIdea={onSelectIdea}
          onDeleteIdea={onDeleteIdea}
        />
      ))}
    </Box>
  );
};

interface IdeaProps {
  ideaId: string | null;
  idea: IIdeaData;
  ideaNumber: number;
  onSelectIdea: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

const Idea = ({
  ideaId,
  idea,
  ideaNumber,
  onSelectIdea,
  onDeleteIdea,
}: IdeaProps) => {
  const { formatMessage } = useIntl();

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea.relationships.idea_import?.data?.id,
  });

  const [deletingIdea, setDeletingIdea] = useState<string | null>(null);

  if (!ideaMetadata) return null;

  const { locale } = ideaMetadata.data.attributes;
  const title = idea.attributes.title_multiloc[locale];

  const handleDeleteIdea = (ideaId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingIdea(ideaId);
    onDeleteIdea(ideaId);
  };

  return (
    <StyledBox
      key={idea.id}
      py="8px"
      borderBottom={`1px ${colors.grey400} solid`}
      style={{ cursor: 'pointer' }}
      bgColor={idea.id === ideaId ? colors.teal50 : undefined}
      position="relative"
      onClick={() => {
        onSelectIdea(idea.id);
      }}
    >
      <Text
        m="0"
        color="black"
        fontSize="m"
        fontWeight={idea.id === ideaId ? 'bold' : 'normal'}
      >
        {title
          ? truncate(title, 80)
          : `${formatMessage(messages.noTitleInputLabel)} ${ideaNumber}`}
      </Text>
      <Text m="0" mt="3px" fontSize="s" color="grey600">
        {moment(idea.attributes.created_at).format('YYYY-MM-DD HH:mm:ss')}
      </Text>

      <Box
        position="absolute"
        left="0"
        top="0"
        w="100%"
        h="100%"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        {deletingIdea === idea.id ? (
          <Box marginRight="8px">
            <Spinner size="15px" />
          </Box>
        ) : (
          <StyledButton
            icon="close"
            iconSize="12px"
            padding="2px"
            borderRadius="10px"
            marginRight="8px"
            bgColor={colors.teal200}
            onClick={handleDeleteIdea(idea.id)}
          />
        )}
      </Box>
    </StyledBox>
  );
};

export default IdeaList;
