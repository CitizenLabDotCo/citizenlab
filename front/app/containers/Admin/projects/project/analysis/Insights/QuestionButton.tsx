import React, { useEffect, useState } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import { IQuestionPreCheck } from 'api/analysis_question_pre_check/types';
import useAddAnalysisQuestionPreCheck from 'api/analysis_question_pre_check/useAddAnalysisQuestionPreCheck';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const QuestionButton = ({ onClick }: { onClick: () => void }) => {
  const askAQuestionAllowed = useFeatureFlag({
    name: 'ask_a_question',
    onlyCheckAllowed: true,
  });

  const { formatMessage } = useIntl();
  const { mutate: addQuestionPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisQuestionPreCheck();
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
  const filters = useAnalysisFilterParams();

  const [preCheck, setPreCheck] = useState<IQuestionPreCheck | null>(null);
  useEffect(() => {
    addQuestionPreCheck(
      { analysisId, filters },
      {
        onSuccess: (preCheck) => {
          setPreCheck(preCheck);
        },
      }
    );
  }, [analysisId, filters, addQuestionPreCheck]);

  const tooManyInputs =
    preCheck?.data.attributes.impossible_reason === 'too_many_inputs';

  const questionPossible = !tooManyInputs && askAQuestionAllowed;

  const tooltipContent = !askAQuestionAllowed
    ? formatMessage(messages.askAQuestionUpsellMessage)
    : tooManyInputs
    ? formatMessage(messages.tooManyInputs)
    : undefined;

  return (
    <Tooltip
      content={<p>{tooltipContent}</p>}
      placement="auto-start"
      zIndex={99999}
      disabled={!tooltipContent}
    >
      <Box h="100%">
        <Button
          icon="question-bubble"
          mb="4px"
          size="s"
          w="100%"
          h="100%"
          buttonStyle="admin-dark"
          processing={isLoadingPreCheck}
          onClick={onClick}
          disabled={!questionPossible || !askAQuestionAllowed}
          whiteSpace="wrap"
        >
          {formatMessage(messages.askQuestion)}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default QuestionButton;
