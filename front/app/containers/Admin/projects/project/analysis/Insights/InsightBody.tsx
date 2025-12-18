import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FormatMessage } from 'typings';

import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

import FilterItems from 'containers/Admin/projects/project/analysis/FilterItems';
import {
  deleteTrailingIncompleteIDs,
  replaceIdRefsWithLinks,
} from 'containers/Admin/projects/project/analysis/Insights/util';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import FileItem from '../FileItem';

import messages from './messages';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

const getErrorMessage = (
  failureReason: string | null,
  formatMessage: FormatMessage
) => {
  const message = failureReason ? failureMessages[failureReason] : null;
  return formatMessage(message || messages.taskFailureGenericError);
};

const failureMessages = {
  unsupported_file_type: messages.taskFailureUnsupportedFileType,
  too_many_images: messages.taskFailureTooManyImages,
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

  const errorMessage = isFailed
    ? getErrorMessage(task.data.attributes.failure_reason, formatMessage)
    : null;

  const selectedInputId = search.get('selected_input_id') || undefined;

  return (
    <>
      {filters && !isEmpty(filters) && (
        <FilterItems
          filters={filters}
          isEditable={false}
          analysisId={analysisId}
        />
      )}

      {fileIds && fileIds.length > 0 && (
        <Box display="flex" gap="4px">
          {fileIds.map((fileId) => (
            <FileItem key={fileId} fileId={fileId} />
          ))}
        </Box>
      )}

      {errorMessage ? (
        <Error
          text={errorMessage}
          showIcon={true}
          showBackground={true}
          scrollIntoView={false}
        />
      ) : (
        <>
          <StyledInsightsText>
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
  );
};

export default InsightBody;
