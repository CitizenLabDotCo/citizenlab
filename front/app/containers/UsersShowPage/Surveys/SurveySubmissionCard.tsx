import React from 'react';

import { Box, Button, Title, colors } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import { IdeaMiniData } from 'api/user_survey_submissions/types';

import useLocalize from 'hooks/useLocalize';

import { downloadSurveySubmission } from './utils';

interface Props {
  ideaMini: IdeaMiniData;
}

const SurveySubmissionCard = ({ ideaMini }: Props) => {
  const { data: phase } = usePhase(
    ideaMini.relationships.creation_phase.data.id
  );
  const localize = useLocalize();

  const handleClick = () => {
    downloadSurveySubmission(ideaMini.id);
  };

  if (!phase) return null;

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
        {localize(phase.data.attributes.title_multiloc)}
      </Title>
      <Button w="auto" onClick={handleClick}>
        Click here to download
      </Button>
    </Box>
  );
};

export default SurveySubmissionCard;
