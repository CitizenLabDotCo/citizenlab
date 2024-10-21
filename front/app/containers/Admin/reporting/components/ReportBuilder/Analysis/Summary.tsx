import React from 'react';

import {
  Box,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

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
      data-cy="e2e-report-builder-analysis-summary"
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
                [selectedLocale]: `<p>${removeRefs(summary).replace(
                  /(\r\n|\n|\r)/gm,
                  '</p><p>'
                )}</p>`,
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
        <SummaryHeader />
        <InsightBody
          text={summary}
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

export default Summary;
