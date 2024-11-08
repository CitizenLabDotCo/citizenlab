import React from 'react';

import {
  Box,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';

import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import InsightFooter from 'containers/Admin/projects/project/analysis/Insights/InsightFooter';
import QuestionHeader from 'containers/Admin/projects/project/analysis/Insights/QuestionHeader';
import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import TextMultiloc from '../Widgets/TextMultiloc';

import DraggableInsight from './DraggableInsights';

const Question = ({
  questionId,
  analysisId,
  projectId,
  phaseId,
  selectedLocale,
}: {
  questionId: string;
  analysisId: string;
  projectId: string;
  phaseId?: string;
  selectedLocale: string;
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
      data-cy="e2e-report-builder-analysis-question"
    >
      <Box
        border={`1px solid ${colors.borderLight}`}
        padding="8px"
        borderBottom={`1px solid ${colors.white}`}
        borderRadius={stylingConsts.borderRadius}
        w="fit-content"
        zIndex={'1'}
        style={{
          cursor: 'grab',
        }}
      >
        <DraggableInsight
          id="e2e-draggable-insight"
          component={
            <TextMultiloc
              text={{
                [selectedLocale]: `<p><strong>${question}</strong></p><p>${removeRefs(
                  answer
                ).replace(/(\r\n|\n|\r)/gm, '</p><p>')}</p>`,
              }}
            />
          }
        >
          <Icon name="menu" fill={colors.textSecondary} />
        </DraggableInsight>
      </Box>

      <Box
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        px="12px"
        py="8px"
        mt="-1px"
      >
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
      </Box>
    </Box>
  );
};

export default Question;
