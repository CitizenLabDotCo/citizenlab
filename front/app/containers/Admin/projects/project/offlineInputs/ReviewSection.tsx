import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Spinner, Title, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

const ReviewSection = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
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
    <Box mt="40px" w="100%" bgColor={colors.white}>
      <Box display="flex" justifyContent="center" w="100%">
        <Box w="800px" p="20px">
          <Title variant="h2" color="primary">
            Ideas imported
          </Title>
        </Box>
      </Box>

      <Box display="flex" w="100%" p="50px" justifyContent="space-between">
        <Box>
          {ideas.data.map((idea) => (
            <Box key={idea.id}>
              <Text>{localize(idea.attributes.title_multiloc)}</Text>
            </Box>
          ))}
        </Box>
        <Box>Idea form</Box>
        <Box>PDF preview</Box>
      </Box>
    </Box>
  );
};

export default ReviewSection;
