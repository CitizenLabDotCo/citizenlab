import React, { useCallback } from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import InputType from 'components/admin/FormResults/FormResultsQuestion/InputType';
import MatrixQuestion from 'components/admin/FormResults/FormResultsQuestion/MatrixQuestion';
import RankingQuestion from 'components/admin/FormResults/FormResultsQuestion/RankingQuestion';
import SentimentQuestion from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion';
import Legend from 'components/admin/Graphs/Legend';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';
import SurveyBarsHorizontal from 'components/admin/Graphs/SurveyBars/SurveyBarsHorizontal';
import SurveyBarsVertical from 'components/admin/Graphs/SurveyBars/SurveyBarsVertical';

import { useIntl } from 'utils/cl-intl';

import MissingData from '../../_shared/MissingData';

import MapQuestion from './MapQuestions';
import { getLegendLabels } from './utils';

interface Props {
  projectId: string;
  phaseId: string;
  questionId: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
  year?: number;
  quarter?: number;
  heatmap?: boolean;
}

const SurveyQuestionResult = ({
  projectId,
  phaseId,
  questionId,
  groupMode,
  groupFieldId,
  heatmap,
  year,
  quarter,
}: Props) => {
  const { data, error } = useSurveyQuestionResult({
    phase_id: phaseId,
    question_id: questionId,
    group_mode: groupMode,
    group_field_id: groupFieldId,
    year: year?.toString(),
    quarter: quarter?.toString(),
  });

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const renderQuestionComponent = useCallback(() => {
    if (!data) return null;

    const { attributes } = data.data;

    switch (attributes.inputType) {
      case 'ranking':
        return !attributes.grouped ? (
          <RankingQuestion result={attributes} hideDetailsButton={true} />
        ) : null;
      case 'matrix_linear_scale':
        return !attributes.grouped ? (
          <MatrixQuestion result={attributes} />
        ) : null;
      case 'sentiment_linear_scale':
        return (
          <>
            <SentimentQuestion
              result={attributes}
              showAnalysis={false}
              legendLabels={
                attributes.grouped
                  ? getLegendLabels(attributes, localize, formatMessage)
                  : undefined
              }
              mr="20px"
            />
          </>
        );
      case 'point':
      case 'line':
      case 'polygon':
        return (
          <MapQuestion
            attributes={attributes}
            projectId={projectId}
            heatmap={heatmap}
            customFieldId={questionId}
          />
        );
      case 'rating':
      case 'linear_scale':
        return (
          <>
            <SurveyBarsVertical
              questionResult={attributes}
              colorScheme={DEFAULT_CATEGORICAL_COLORS}
              showLabelsBelow
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
        );
      default:
        return (
          <>
            <SurveyBarsHorizontal
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
        );
    }
  }, [data, formatMessage, heatmap, localize, projectId, questionId]);

  if (error) return <MissingData />;
  if (!data) return null;

  const { attributes } = data.data;

  // For some input types, we don't want to show the title
  const showTitle = !['sentiment_linear_scale'].includes(attributes.inputType);

  return (
    <Box mb="8px">
      {showTitle && (
        <Title
          variant="h4"
          mt="0px"
          mb="8px"
          className="e2e-survey-question-widget-title"
        >
          {localize(attributes.question)}
        </Title>
      )}

      <InputType
        inputType={attributes.inputType}
        required={attributes.required}
        totalSubmissions={attributes.totalResponseCount}
        totalResponses={attributes.questionResponseCount}
      />
      {renderQuestionComponent()}
    </Box>
  );
};

export default SurveyQuestionResult;
