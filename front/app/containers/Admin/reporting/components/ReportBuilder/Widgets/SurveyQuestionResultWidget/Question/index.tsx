import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import InputType from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/InputType';

import Legend from 'components/admin/Graphs/Legend';

import { useIntl } from 'utils/cl-intl';

import MissingData from '../../_shared/MissingData';

import GroupedBars from './GroupedBars';
import PointLocationQuestion from './PointLocationQuestion';
import UngroupedBars from './UngroupedBars';
import { getColorScheme, getLegendLabels } from './utils';

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
  const { data } = useSurveyQuestionResult({
    phase_id: phaseId,
    question_id: questionId,
    group_mode: groupMode,
    group_field_id: groupFieldId,
  });

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!data) return <MissingData />;

  const { attributes } = data.data;

  const colorScheme = attributes.grouped
    ? getColorScheme(attributes.legend.length)
    : undefined;

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
          {attributes.grouped && colorScheme && (
            <Box>
              <GroupedBars attributes={attributes} colorScheme={colorScheme} />
              <Box mt="20px">
                <Legend
                  labels={getLegendLabels(attributes, localize, formatMessage)}
                  colors={colorScheme}
                />
              </Box>
            </Box>
          )}

          {!attributes.grouped && <UngroupedBars attributes={attributes} />}
        </>
      )}
    </Box>
  );
};

export default SurveyQuestionResult;
