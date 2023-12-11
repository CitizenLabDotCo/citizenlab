import React from 'react';
import moment from 'moment';

// api
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';

// components
import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// utils
import { truncate } from 'utils/textUtils';

// typings
import { IIdeaData, IIdeas } from 'api/ideas/types';

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
    <>
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
    </>
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

  if (!ideaMetadata) return null;

  const { locale } = ideaMetadata.data.attributes;
  const title = idea.attributes.title_multiloc[locale];

  const handleDeleteIdea = (ideaId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        {moment(idea.attributes.created_at).format('YYYY-MM-DD')}
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
        <StyledButton
          icon="close"
          iconSize="12px"
          padding="2px"
          borderRadius="10px"
          marginRight="8px"
          bgColor={colors.teal200}
          onClick={handleDeleteIdea(idea.id)}
        />
      </Box>
    </StyledBox>
  );
};

export default IdeaList;
