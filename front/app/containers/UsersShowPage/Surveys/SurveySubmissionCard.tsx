import React from 'react';

import { Box, Button, Title, colors } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { downloadSurveySubmission } from './utils';

interface Props {
  idea: IIdeaData;
}

const SurveySubmissionCard = ({ idea }: Props) => {
  const { data: project } = useProjectById(idea.relationships.project.data.id);
  const localize = useLocalize();

  const handleClick = () => {
    downloadSurveySubmission(idea.id);
  };

  if (!project) return;

  return (
    <Box
      p="20px"
      bgColor={colors.white}
      width="400px"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Title variant="h2" mt="0">
        {localize(project.data.attributes.title_multiloc)}
      </Title>
      <Button w="auto" onClick={handleClick}>
        Click here to download
      </Button>
    </Box>
  );
};

export default SurveySubmissionCard;
