import React from 'react';
import moment from 'moment';

// routing
import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Spinner, Title, Text } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// TODO move to component library
const TEAL50 = '#EDF8FA';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${TEAL50};
  }
`;

const ReviewSection = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('idea_id');

  const { data: ideas, isLoading } = useImportedIdeas({ projectId });
  const localize = useLocalize();

  if (isLoading) {
    return (
      <Box w="100%" mt="60px" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (ideas === undefined || ideas.data.length === 0) return null;

  return (
    <Box mt="40px" w="100%" bgColor={colors.white} py="32px">
      <Title variant="h2" color="primary" px="52px" mb="40px">
        Ideas imported
      </Title>

      <Box display="flex" w="100%" px="52px" justifyContent="space-between">
        <Box w="25%" borderRight={`1px ${colors.grey400} solid`} pr="8px">
          {ideas.data.map((idea) => (
            <StyledBox
              key={idea.id}
              py="8px"
              borderBottom={`1px ${colors.grey400} solid`}
              style={{ cursor: 'pointer' }}
              bgColor={idea.id === ideaId ? TEAL50 : undefined}
              onClick={() => {
                updateSearchParams({ idea_id: idea.id });
              }}
            >
              <Text
                m="0"
                color="black"
                fontSize="m"
                fontWeight={idea.id === ideaId ? 'bold' : 'normal'}
              >
                {localize(idea.attributes.title_multiloc)}
              </Text>
              <Text m="0" mt="3px" fontSize="s" color="grey600">
                {moment(idea.attributes.created_at).format('YYYY-MM-DD')}
              </Text>
            </StyledBox>
          ))}
        </Box>
        <Box w="35%" borderRight={`1px ${colors.grey400} solid`}>
          Idea form
        </Box>
        <Box w="40%">PDF preview</Box>
      </Box>
    </Box>
  );
};

export default ReviewSection;
