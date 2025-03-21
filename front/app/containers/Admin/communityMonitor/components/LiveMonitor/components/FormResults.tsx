import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

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
  const { data: formResults } = useFormResults({
    phaseId,
    filterLogicIds: [],
    quarter: parseInt(quarter, 10),
    year: parseInt(year, 10),
  });

  if (!formResults || !project) {
    return null;
  }

  const { results } = formResults.data.attributes;

  // Filter the results to only include sentiment questions
  const sentimentQuestionResults = results.filter(
    (question) => question.inputType === 'sentiment_linear_scale'
  );

  const isFirstQuestionInCategory = (category: string, index: number) => {
    return (
      sentimentQuestionResults.at(index - 1)?.questionCategory !== category
    );
  };

  return (
    <Box width="100%">
      <Box>
        {sentimentQuestionResults.map((result, index) => {
          const category = result.questionCategory;
          return (
            <Box key={index}>
              {category && isFirstQuestionInCategory(category, index) && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="8px"
                  mt="30px"
                >
                  <Box display="flex" alignItems="center">
                    <Text m="0px" fontSize="l" fontWeight="bold">
                      <Icon
                        width="16px"
                        name="dot"
                        fill={categoryColors[category]}
                        mr="4px"
                        my="auto"
                      />
                      {category}
                    </Text>
                  </Box>
                </Box>
              )}
              <SentimentQuestion key={index} result={result} mb="8px" />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default FormResults;
