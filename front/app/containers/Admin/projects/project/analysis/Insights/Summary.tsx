import React from 'react';
import { useParams } from 'react-router-dom';

import useDeleteAnalysisSummary from 'api/analysis_summaries/useDeleteAnalysisSummary';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { ISummary } from 'api/analysis_summaries/types';

import {
  Box,
  IconButton,
  Spinner,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

type Props = {
  summary: ISummary['data'];
};
const Summary = ({ summary }: Props) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteSummary } = useDeleteAnalysisSummary();

  const { data: backgroundTask } = useAnalysisBackgroundTask(
    analysisId,
    summary.relationships.background_task.data.id
  );
  const processing =
    backgroundTask?.data.attributes.state === 'in_progress' ||
    backgroundTask?.data.attributes.state === 'queued';

  const handleSummaryDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteSummaryConfirmation))) {
      deleteSummary({
        analysisId,
        id,
      });
    }
  };

  const hasFilters = !!Object.keys(summary.attributes.filters).length;

  return (
    <Box
      key={summary.id}
      bgColor={colors.teal100}
      p="16px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
    >
      <Box>
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="4px"
          mb="6px"
        >
          {hasFilters && (
            <>
              <Box>Summary for</Box>
              {Object.entries(summary.attributes.filters).map(([k, v]) => (
                <Box
                  key={k}
                  bgColor={colors.teal200}
                  color={colors.teal700}
                  py="2px"
                  px="4px"
                  borderRadius={stylingConsts.borderRadius}
                >
                  {k}: {v}
                </Box>
              ))}
            </>
          )}

          {!hasFilters && (
            <>
              <Box>Summary</Box>
            </>
          )}
        </Box>
      </Box>
      <Box>
        {summary.attributes.summary}
        {processing && <Spinner />}
      </Box>
      <Box display="flex" flexDirection="row-reverse" gap="2px">
        <IconButton
          iconName="delete"
          onClick={() => handleSummaryDelete(summary.id)}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
        />
      </Box>
    </Box>
  );
};

export default Summary;
