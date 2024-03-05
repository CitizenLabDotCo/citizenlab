import { Box } from '@citizenlab/cl2-component-library';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import InsightFooter from 'containers/Admin/projects/project/analysis/Insights/InsightFooter';
import QuestionHeader from 'containers/Admin/projects/project/analysis/Insights/QuestionHeader';
import React from 'react';

const Question = ({
  questionId,
  analysisId,
  projectId,
  phaseId,
}: {
  questionId: string;
  analysisId: string;
  projectId: string;
  phaseId?: string;
}) => {
  const { data } = useAnalysisQuestion({ analysisId, id: questionId });

  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  const filters = data?.data.attributes.filters;
  const generatedAt = data?.data.attributes.generated_at;

  if (!question || !answer) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="16px"
    >
      <QuestionHeader question={question} />
      <InsightBody
        text={answer}
        filters={filters}
        analysisId={analysisId}
        projectId={projectId}
        phaseId={phaseId}
        generatedAt={generatedAt}
        backgroundTaskId={data?.data.relationships.background_task.data.id}
      />
      <InsightFooter
        filters={filters}
        generatedAt={generatedAt}
        analysisId={analysisId}
        projectId={projectId}
        phaseId={phaseId}
        customFieldIds={data?.data.attributes.custom_field_ids}
      />
    </Box>
  );
};

export default Question;
