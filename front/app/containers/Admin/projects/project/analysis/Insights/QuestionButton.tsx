import {
  Box,
  Button,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisQuestionPreCheck from 'api/analysis_question_pre_check/useAddAnalysisQuestionPreCheck';
import { IQuestionPreCheck } from 'api/analysis_question_pre_check/types';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import Tippy from '@tippyjs/react';
import useFeatureFlag from 'hooks/useFeatureFlag';

const QuestionButton = ({ onClick }: { onClick: () => void }) => {
  const askAQuestionEnabled = useFeatureFlag({
    name: 'ask_a_question',
    onlyCheckAllowed: true,
  });

  const { formatMessage } = useIntl();
  const { mutate: addQuestionPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisQuestionPreCheck();
  const { analysisId } = useParams() as { analysisId: string };
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

  const questionPossible = !preCheck?.data.attributes.impossible_reason;
  const questionAccuracy = preCheck?.data.attributes.accuracy;

  return (
    <Tippy
      content={<p>{formatMessage(messages.askAQuestionUpsellMessage)}</p>}
      placement="auto-start"
      zIndex={99999}
      disabled={askAQuestionEnabled}
    >
      <Box>
        <Button
          justify="left"
          icon="question-bubble"
          mb="4px"
          size="s"
          w="100%"
          buttonStyle="secondary-outlined"
          processing={isLoadingPreCheck}
          onClick={onClick}
          disabled={!questionPossible || !askAQuestionEnabled}
          whiteSpace="wrap"
        >
          {formatMessage(messages.askQuestion)}
          <br />
          <Text fontSize="s" m="0" color="grey600" whiteSpace="nowrap">
            <Box display="flex" gap="4px">
              {questionPossible && questionAccuracy && (
                <>
                  <FormattedMessage
                    {...messages.accuracy}
                    values={{
                      accuracy: questionAccuracy * 100,
                      percentage: formatMessage(messages.percentage),
                    }}
                  />
                  {askAQuestionEnabled && (
                    <IconTooltip
                      icon="info-outline"
                      content={formatMessage(messages.questionAccuracyTooltip)}
                    />
                  )}
                </>
              )}
              {!questionPossible && (
                <>
                  <FormattedMessage {...messages.tooManyInputs} />
                  <IconTooltip
                    icon="info-solid"
                    content={formatMessage(messages.tooManyInputsTooltip)}
                  />
                </>
              )}
            </Box>
          </Text>
        </Button>
      </Box>
    </Tippy>
  );
};

export default QuestionButton;
