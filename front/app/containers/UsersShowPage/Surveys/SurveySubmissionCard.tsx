import React from 'react';

import { Box, Button, Title, colors } from '@citizenlab/cl2-component-library';

import { IdeaMini } from 'api/user_survey_submissions/types';

import { downloadSurveySubmission } from './utils';

interface Props {
  ideaMini: IdeaMini;
}

const SurveySubmissionCard = ({ ideaMini }: Props) => {
  const handleClick = () => {
    downloadSurveySubmission(ideaMini.id);
  };

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
        Card title
      </Title>
      <Button w="auto" onClick={handleClick}>
        Click here to download
      </Button>
    </Box>
  );
};

export default SurveySubmissionCard;
