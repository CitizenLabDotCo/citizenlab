import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import useRegenerateAnalysisQuestion from 'api/analysis_questions/useRegenerateAnalysisQuestion';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import InsightFooter from 'containers/Admin/projects/project/analysis/Insights/InsightFooter';
import QuestionHeader from 'containers/Admin/projects/project/analysis/Insights/QuestionHeader';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

import { convertFilterValuesToString } from './utils';

const Question = ({
  questionId,
  analysisId,
}: {
  questionId: string;
  analysisId: string;
}) => {
  const { formatMessage } = useIntl();

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const { data } = useAnalysisQuestion({ analysisId, id: questionId });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { mutate: regenerateQuestion, isLoading: isLoadingRegenerateQuestion } =
    useRegenerateAnalysisQuestion();

  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  const filters = data?.data.attributes.filters;
  const generatedAt = data?.data.attributes.generated_at;
  const missingInputsCount = data?.data.attributes.missing_inputs_count || 0;

  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const filteredInputCount = filteredInputs?.pages[0].meta.filtered_count || 0;

  const refreshDisabled =
    missingInputsCount === 0 ||
    (!largeSummariesAllowed && filteredInputCount > 30);

  if (!question || !answer) {
    return <Spinner />;
  }

  return (
    <>
      {(!question || !answer) && <Spinner />}

      <Box
        flexDirection="column"
        justifyContent="space-between"
        h="460px"
        gap="16px"
        display={!question || !answer ? 'none' : 'flex'}
      >
        <Box overflowY="auto" h="100%">
          <QuestionHeader question={question} />
          <InsightBody
            text={answer}
            filters={filters}
            analysisId={analysisId}
            projectId={projectId}
            phaseId={phaseId}
            generatedAt={generatedAt}
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            backgroundTaskId={data?.data.relationships.background_task.data.id}
          />
        </Box>
        <InsightFooter
          filters={filters}
          generatedAt={generatedAt}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          customFieldIds={data?.data.attributes.custom_field_ids}
        />
        <Box display="flex" gap="16px">
          <Button
            disabled={refreshDisabled}
            buttonStyle="secondary-outlined"
            icon="refresh"
            onClick={() => {
              regenerateQuestion({ analysisId, questionId });
            }}
            processing={isLoadingRegenerateQuestion}
          >
            <FormattedMessage
              {...messages.refresh}
              values={{ count: missingInputsCount }}
            />
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            icon="eye"
            linkTo={`/admin/projects/${projectId}/analysis/${analysisId}?${stringify(
              { ...convertFilterValuesToString(filters), phase_id: phaseId }
            )}`}
          >
            {formatMessage(messages.explore)}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Question;
