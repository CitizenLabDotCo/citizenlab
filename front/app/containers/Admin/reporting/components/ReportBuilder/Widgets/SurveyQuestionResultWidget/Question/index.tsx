import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import InputType from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/InputType';
import MatrixQuestion from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MatrixQuestion';
import RankingQuestion from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/RankingQuestion';

import Legend from 'components/admin/Graphs/Legend';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';
import SurveyBarsVertical from 'components/admin/Graphs/SurveyBars/SurveyBarsVertical';

import { useIntl } from 'utils/cl-intl';

import MissingData from '../../_shared/MissingData';

import MapQuestion from './MapQuestions';
import { getLegendLabels, isMapBasedQuestion } from './utils';

interface Props {
  projectId: string;
  phaseId: string;
  questionId: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
  heatmap?: boolean;
}

const SurveyQuestionResult = ({
  projectId,
  phaseId,
  questionId,
  groupMode,
  groupFieldId,
  heatmap,
}: Props) => {
  const { data, error } = useSurveyQuestionResult({
    phase_id: phaseId,
    question_id: questionId,
    group_mode: groupMode,
    group_field_id: groupFieldId,
  });

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (error) return <MissingData />;
  if (!data) return null;

  const { attributes } = data.data;

  return (
    <Box mb="8px">
      <Title
        variant="h4"
        mt="0px"
        mb="8px"
        className="e2e-survey-question-widget-title"
      >
        {localize(attributes.question)}
      </Title>
      <InputType
        inputType={attributes.inputType}
        required={attributes.required}
        totalSubmissions={attributes.totalResponseCount}
        totalResponses={attributes.questionResponseCount}
      />
      {isMapBasedQuestion(attributes.inputType) ? (
        <MapQuestion
          attributes={attributes}
          projectId={projectId}
          heatmap={heatmap}
          customFieldId={questionId}
        />
      ) : (
        <>
          {attributes.inputType === 'ranking' && !attributes.grouped && (
            <Box>
              <RankingQuestion result={attributes} hideDetailsButton={true} />
            </Box>
          )}
          {attributes.inputType === 'matrix_linear_scale' &&
            !attributes.grouped && (
              <Box>
                <MatrixQuestion result={attributes} />
              </Box>
            )}
          <SurveyBarsVertical
            questionResult={attributes}
            colorScheme={DEFAULT_CATEGORICAL_COLORS}
          />
          {attributes.grouped && (
            <Box mt="20px">
              <Legend
                labels={getLegendLabels(attributes, localize, formatMessage)}
                colors={DEFAULT_CATEGORICAL_COLORS}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SurveyQuestionResult;
