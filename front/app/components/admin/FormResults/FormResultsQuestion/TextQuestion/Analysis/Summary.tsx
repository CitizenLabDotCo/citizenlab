import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';

import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRegenerateAnalysisSummary from 'api/analysis_summaries/useRegenerateAnalysisSummary';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import InsightFooter from 'containers/Admin/projects/project/analysis/Insights/InsightFooter';
import SummaryHeader from 'containers/Admin/projects/project/analysis/Insights/SummaryHeader';
import tracks from 'containers/Admin/projects/project/analysis/tracks';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

import { convertFilterValuesToString } from './utils';

const Summary = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { formatMessage } = useIntl();

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data } = useAnalysisSummary({ analysisId, id: summaryId });

  const { mutate: regenerateSummary, isLoading: isLoadingRegenerateSummary } =
    useRegenerateAnalysisSummary();

  const summary = data?.data.attributes.summary;
  const filters = data?.data.attributes.filters;
  const generatedAt = data?.data.attributes.generated_at;
  const missingInputsCount = data?.data.attributes.missing_inputs_count || 0;
  const backgroundTaskId = data?.data.relationships.background_task.data.id;

  const { data: task } = useAnalysisBackgroundTask(
    analysisId,
    backgroundTaskId,
    true
  );

  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const filteredInputCount = filteredInputs?.pages[0].meta.filtered_count || 0;
  const backgroundTaskFailed = task?.data.attributes.state === 'failed';
  const showSpinner = !summary && !backgroundTaskFailed;

  const refreshDisabled =
    !backgroundTaskFailed &&
    (missingInputsCount === 0 ||
      (!largeSummariesAllowed && filteredInputCount > 30));

  return (
    <>
      {showSpinner && <Spinner />}

      <Box
        id="e2e-analysis-summary"
        flexDirection="column"
        justifyContent="space-between"
        h="460px"
        gap="16px"
        display={showSpinner ? 'none' : 'flex'}
      >
        <Box overflowY="auto" h="100%">
          <SummaryHeader />
          <InsightBody
            text={summary || ''}
            filters={filters}
            analysisId={analysisId}
            projectId={projectId}
            phaseId={phaseId}
            generatedAt={generatedAt}
            backgroundTaskId={backgroundTaskId}
          />
          {backgroundTaskFailed && (
            <Error text={formatMessage(messages.backgroundTaskFailedMessage)} />
          )}
        </Box>

        <InsightFooter
          filters={filters}
          generatedAt={generatedAt}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          customFieldIds={data?.data.attributes.custom_field_ids}
        />

        <Box display="flex" gap="16px">
          <ButtonWithLink
            disabled={refreshDisabled}
            buttonStyle="secondary-outlined"
            icon="refresh"
            onClick={() => {
              regenerateSummary({ analysisId, summaryId });
              trackEventByName(tracks.regenerateAIInsights);
            }}
            processing={isLoadingRegenerateSummary}
          >
            {backgroundTaskFailed ? (
              <FormattedMessage {...messages.regenerate} />
            ) : (
              <FormattedMessage
                {...messages.refresh}
                values={{ count: missingInputsCount }}
              />
            )}
          </ButtonWithLink>
          <ButtonWithLink
            id="e2e-explore-summary"
            buttonStyle="secondary-outlined"
            icon="eye"
            linkTo={`/admin/projects/${projectId}/analysis/${analysisId}?${stringify(
              { ...convertFilterValuesToString(filters), phase_id: phaseId }
            )}`}
          >
            {formatMessage(messages.explore)}
          </ButtonWithLink>
        </Box>
      </Box>
    </>
  );
};

export default Summary;
