import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import GroupedBars from './GroupedBars';
import UngroupedBars from './UngroupedBars';
import Source from './Source';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// utils
import { getColorScheme, getLegendLabels } from './utils';

// typings
import { GroupMode } from 'api/graph_data_units/requestTypes';
import Legend from 'components/admin/Graphs/Legend';

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
      <Title variant="h4" mt="0px" mb="8px">
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
