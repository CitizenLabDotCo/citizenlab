import React from 'react';

import {
  Box,
  Icon,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

import useLocalize from 'hooks/useLocalize';

import SentimentQuestion from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/SentimentQuestion';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  projectId?: string;
  phaseId?: string;
};

const FormResults = (props: Props) => {
  const localize = useLocalize();

  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const projectId = props.projectId || projectIdParam;
  const phaseId = props.phaseId || phaseIdParam;

  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);

  const { data: formResults } = useFormResults({
    phaseId,
    filterLogicIds: [],
  });

  if (!formResults || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults.data.attributes;

  return (
    <Box width="100%">
      {totalSubmissions === 0 && (
        <Box width="100%">
          <Text variant="bodyM" color="textSecondary">
            {formatMessage(messages.noSurveyResponses)}
          </Text>
        </Box>
      )}
      <Box>
        {totalSubmissions > 0 &&
          results.map((result, index) => {
            if (result.inputType === 'page') {
              return (
                <Box display="flex" key={index} mb="20px" mt="48px">
                  <Icon
                    my="auto"
                    name="dot"
                    width="18px"
                    mr="4px"
                    fill={colors.teal}
                  />
                  <Title variant="h4" m="0px" fontWeight="bold">
                    {localize(result.question)}
                  </Title>
                </Box>
              );
            } else {
              return (
                <SentimentQuestion
                  key={index}
                  result={result}
                  mb="8px"
                  titleVariant="h5"
                />
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default FormResults;
