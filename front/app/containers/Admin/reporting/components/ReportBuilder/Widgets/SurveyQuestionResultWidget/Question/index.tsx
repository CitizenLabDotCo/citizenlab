import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import UngroupedBars from './UngroupedBars';
import Source from './Source';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// typings
import { GroupMode } from 'api/graph_data_units/requestTypes';

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
      <Box>
        {attributes.grouped ? <></> : <UngroupedBars attributes={attributes} />}
      </Box>
      <Source projectId={projectId} phaseId={phaseId} />
    </>
  );
};

export default SurveyQuestionResult;
