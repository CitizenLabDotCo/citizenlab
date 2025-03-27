import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useSurveyResults from 'api/survey_results/useSurveyResults';

import useLocalize from 'hooks/useLocalize';

import SentimentQuestion from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion';

import {
  categoryColors,
  getQuarterFilter,
  getYearFilter,
} from './HealthScoreWidget/utils';

type Props = {
  projectId?: string;
  phaseId?: string;
};

const FormResults = (props: Props) => {
  const localize = useLocalize();

  // Get the projectId and phaseId from the URL
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const projectId = props.projectId || projectIdParam;
  const phaseId = props.phaseId || phaseIdParam;

  const { data: project } = useProjectById(projectId);

  // Get the current year and quarter for the results
  const [search] = useSearchParams();

  // Get the year and quarter
  const year = getYearFilter(search);
  const quarter = getQuarterFilter(search);

  // Fetch the form results
  const { data: formResults } = useSurveyResults({
    phaseId,
    filterLogicIds: [],
    quarter: parseInt(quarter, 10),
    year: parseInt(year, 10),
  });

  if (!formResults || !project) {
    return null;
  }

  const { results } = formResults.data.attributes;

  return (
    <Box width="100%">
      <Box>
        {results.map((result, index) => {
          if (result.inputType === 'page') {
            // Get the question category key from the first question in the page
            const categoryKey = results[index + 1]?.questionCategory;
            return (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb="8px"
                mt="30px"
                key={index}
              >
                <Box display="flex" alignItems="center">
                  <Text m="0px" fontSize="l" fontWeight="bold">
                    <Icon
                      width="16px"
                      name="dot"
                      fill={categoryKey && categoryColors[categoryKey]}
                      mr="4px"
                      my="auto"
                    />
                    {localize(result.question)}
                  </Text>
                </Box>
              </Box>
            );
          } else if (result.inputType === 'sentiment_linear_scale') {
            return (
              <Box key={index}>
                <SentimentQuestion key={index} result={result} mb="8px" />
              </Box>
            );
          }

          return null;
        })}
      </Box>
    </Box>
  );
};

export default FormResults;
