import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import InputType from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/InputType';

import Legend from 'components/admin/Graphs/Legend';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';
import SurveyBars from 'components/admin/Graphs/SurveyBars';

import { useIntl } from 'utils/cl-intl';

import MissingData from '../../_shared/MissingData';

import PointLocationQuestion from './PointLocationQuestion';
import { getLegendLabels } from './utils';

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
        styleVariant="h4"
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
      {attributes.grouped === false && attributes.pointResponses ? (
        <PointLocationQuestion
          pointResponses={attributes.pointResponses}
          mapConfigId={attributes.mapConfigId}
          customFieldId={attributes.customFieldId}
          projectId={projectId}
          heatmap={heatmap}
        />
      ) : (
        <>
          <SurveyBars
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
