import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';

import { useSurveyQuestionResult } from 'api/graph_data_units';
import { GroupMode } from 'api/graph_data_units/requestTypes';

import useLocalize from 'hooks/useLocalize';

import Legend from 'components/admin/Graphs/Legend';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import GroupedBars from './GroupedBars';
import UngroupedBars from './UngroupedBars';
import { getColorScheme, getLegendLabels } from './utils';

interface Props {
  phaseId: string;
  questionId: string;
  groupMode?: GroupMode;
  groupFieldId?: string;
}

const SurveyQuestionResult = ({
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
    <Box mb="8px">
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
    </Box>
  );
};

export default SurveyQuestionResult;
