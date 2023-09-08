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
import translations from './translations';

const QuestionButton = ({ onClick }: { onClick: () => void }) => {
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
        disabled={!questionPossible}
        whiteSpace="wrap"
      >
        {formatMessage(translations.askQuestion)}
        <br />
        <Text fontSize="s" m="0" color="grey600" whiteSpace="nowrap">
          <Box display="flex" gap="4px">
            {questionPossible && questionAccuracy && (
              <>
                <FormattedMessage
                  {...translations.accuracy}
                  values={{
                    accuracy: questionAccuracy * 100,
                    percentage: formatMessage(translations.percentage),
                  }}
                />
                <IconTooltip
                  icon="info-outline"
                  content={formatMessage(translations.questionAccuracyTooltip)}
                />
              </>
            )}
            {!questionPossible && (
              <>
                <FormattedMessage {...translations.tooManyInputs} />
                <IconTooltip
                  icon="info-solid"
                  content={formatMessage(translations.tooManyInputsTooltip)}
                />
              </>
            )}
          </Box>
        </Text>
      </Button>
    </Box>
  );
};

export default QuestionButton;
