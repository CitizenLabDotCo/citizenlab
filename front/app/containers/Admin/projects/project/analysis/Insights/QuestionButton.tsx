import { Box, Button } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisQuestionPreCheck from 'api/analysis_question_pre_check/useAddAnalysisQuestionPreCheck';
import { IQuestionPreCheck } from 'api/analysis_question_pre_check/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';

const QuestionButton = ({ onClick }: { onClick: () => void }) => {
  const { mutate: addSummaryPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisQuestionPreCheck();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const { data } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = data?.pages[0].meta.filtered_count;

  const [preCheck, setPreCheck] = useState<IQuestionPreCheck | null>(null);
  useEffect(() => {
    addSummaryPreCheck(
      { analysisId, filters },
      {
        onSuccess: (preCheck) => {
          setPreCheck(preCheck);
        },
      }
    );
  }, [analysisId, filters, addSummaryPreCheck]);

  const questionPossible = !preCheck?.data.attributes.impossible_reason;
  const questionAccuracy = preCheck?.data.attributes.accuracy;
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        icon="question-bubble"
        mb="12px"
        size="s"
        w="100%"
        buttonStyle="secondary-outlined"
        processing={isLoadingPreCheck}
        onClick={onClick}
        disabled={!questionPossible}
        whiteSpace="wrap"
      >
        {questionPossible &&
          questionAccuracy &&
          `Ask a question about ${inputsCount} inputs (${
            questionAccuracy * 100
          }% accuracy)`}
        {questionPossible &&
          !questionAccuracy &&
          `Ask a question about ${inputsCount} inputs`}
        {!questionPossible && `Too many inputs to ask a question about`}
      </Button>
    </Box>
  );
};

export default QuestionButton;
