import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';

import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';

import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import InsightFooter from 'containers/Admin/projects/project/analysis/Insights/InsightFooter';
import SummaryHeader from 'containers/Admin/projects/project/analysis/Insights/SummaryHeader';
import { removeRefs } from 'containers/Admin/projects/project/analysis/Insights/util';

import TextMultiloc from '../Widgets/TextMultiloc';

import DraggableInsight from './DraggableInsights';

const Summary = ({
  summaryId,
  analysisId,
  projectId,
  phaseId,
  selectedLocale,
}: {
  summaryId: string;
  analysisId: string;
  projectId: string;
  phaseId?: string;
  selectedLocale: string;
}) => {
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });

  const summary = data?.data.attributes.summary;
  const filters = data?.data.attributes.filters;
  const generatedAt = data?.data.attributes.generated_at;

  if (!summary) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="16px"
    >
      <DraggableInsight
        id="e2e-draggable-insight"
        component={
          <TextMultiloc text={{ [selectedLocale]: removeRefs(summary) }} />
        }
      >
        <Icon name="menu" />
      </DraggableInsight>
      <SummaryHeader />
      <InsightBody
        text={summary}
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

export default Summary;
