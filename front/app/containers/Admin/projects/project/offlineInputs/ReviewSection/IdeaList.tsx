import React from 'react';
import moment from 'moment';

// components
import { Box, Text, Button } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { truncate } from 'utils/textUtils';

// typings
import { IIdeas } from 'api/ideas/types';

// TODO move to component library
const TEAL50 = '#EDF8FA';

const StyledButton = styled(Button)``;

const StyledBox = styled(Box)`
  ${StyledButton} {
    display: none;
  }

  &:hover {
    background-color: ${TEAL50};

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
  const localize = useLocalize();

  const handleDeleteIdea = (ideaId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteIdea(ideaId);
  };

  return (
    <>
      {ideas.data.map((idea) => (
        <StyledBox
          key={idea.id}
          py="8px"
          borderBottom={`1px ${colors.grey400} solid`}
          style={{ cursor: 'pointer' }}
          bgColor={idea.id === ideaId ? TEAL50 : undefined}
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
            {truncate(localize(idea.attributes.title_multiloc), 80)}
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
      ))}
    </>
  );
};

export default IdeaList;
