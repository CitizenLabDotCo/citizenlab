import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

import Error from 'components/UI/Error';

import FilterItems from 'containers/Admin/projects/project/analysis/FilterItems';
import {
  deleteTrailingIncompleteIDs,
  replaceIdRefsWithLinks,
} from 'containers/Admin/projects/project/analysis/Insights/util';

import { useIntl } from 'utils/cl-intl';

import FileItem from '../FileItem';
import messages from './messages';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

const getErrorMessage = (
  failureReason?: string | null,
  formatMessage?: any
) => {
  if (!formatMessage) return null;

  switch (failureReason) {
    case 'unsupported_file_type':
      return formatMessage(messages.taskFailedUnsupportedFileType);
    case 'input_too_large':
      return formatMessage(messages.taskFailedInputTooLarge);
    case 'rate_limit_exceeded':
      return formatMessage(messages.taskFailedRateLimit);
    case 'file_preview_failed':
    case 'unknown':
    default:
      return formatMessage(messages.taskFailedGeneric);
  }
};

const InsightBody = ({
  text,
  filters,
  fileIds,
  analysisId,
  projectId,
  phaseId,
  backgroundTaskId,
}: {
  text: string | null;
  filters?: IInputsFilterParams;
  fileIds?: string[];
  analysisId: string;
  projectId: string;
  phaseId?: string;
  generatedAt?: string;
  backgroundTaskId?: string;
}) => {
  const [search] = useSearchParams();
  const { formatMessage } = useIntl();
  const { data: task } = useAnalysisBackgroundTask(
    analysisId,
    backgroundTaskId,
    true
  );

  const isLoading =
    task?.data.attributes.state === 'queued' ||
    task?.data.attributes.state === 'in_progress';

  const isFailed = task?.data.attributes.state === 'failed';

  const selectedInputId = search.get('selected_input_id') || undefined;

  return (
    <div>
      <>
        {filters && !isEmpty(filters) && (
          <Box mb="16px">
            <FilterItems
              filters={filters}
              isEditable={false}
              analysisId={analysisId}
            />
          </Box>
        )}

        {fileIds && fileIds.length > 0 && (
          <Box mb="16px" display="flex" gap="4px">
            {fileIds.map((fileId) => (
              <FileItem key={fileId} fileId={fileId} />
            ))}
          </Box>
        )}

        {isFailed ? (
          <Error
            text={getErrorMessage(
              task?.data.attributes.failure_reason,
              formatMessage
            )}
            showIcon={true}
            showBackground={true}
          />
        ) : (
          <>
            <StyledInsightsText mt="0px">
              {replaceIdRefsWithLinks({
                insight: isLoading ? deleteTrailingIncompleteIDs(text) : text,
                analysisId,
                projectId,
                phaseId,
                selectedInputId,
              })}
            </StyledInsightsText>
            {isLoading && <Spinner />}
          </>
        )}
      </>
    </div>
  );
};

export default InsightBody;
