import React from 'react';

// api
import { Title, Text, Box } from '@citizenlab/cl2-component-library';

import Legend from 'components/admin/Graphs/Legend';

import { useIntl } from 'utils/cl-intl';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import messages from '../messages';

import GroupedBars from './GroupedBars';
import Source from './Source';
import UngroupedBars from './UngroupedBars';
import { getColorScheme, getLegendLabels } from './utils';

interface Props {
  projectId: string;
  phaseId: string;
  questionId: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
}

const SurveyQuestionResult = ({
  projectId,
  phaseId,
  questionId,
  groupMode,
  groupFieldId,
}: Props) => {
  const response = useSurveyQuestionResult({
    phaseId,
    questionId,
    groupMode,
    groupFieldId,
  });

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!response) return null;

  const { attributes } = response.data;

  const colorScheme = attributes.grouped
    ? getColorScheme(attributes.legend.length)
    : undefined;

  return (
    <>
      <Title
        variant="h4"
        mt="0px"
        mb="8px"
        className="e2e-survey-question-widget-title"
      >
        {localize(attributes.question)}
      </Title>
      <Text mt="0px" mb="8px" color="textSecondary" variant="bodyS">
        {formatMessage(messages.numberOfResponses, {
          count: attributes.totalResponses,
        })}
      </Text>
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
      <Source projectId={projectId} phaseId={phaseId} />
    </>
  );
};

export default SurveyQuestionResult;
