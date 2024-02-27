import React from 'react';
import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import {
  deleteTrailingIncompleteIDs,
  replaceIdRefsWithLinks,
} from 'containers/Admin/projects/project/analysis/Insights/util';
import styled from 'styled-components';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

import { IInputsFilterParams } from 'api/analysis_inputs/types';
import FilterItems from 'containers/Admin/projects/project/analysis/FilterItems';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { useSearchParams } from 'react-router-dom';
import { isEmpty } from 'lodash-es';

const InsightBody = ({
  text,
  filters,
  analysisId,
  projectId,
  phaseId,
  backgroundTaskId,
}: {
  text: string | null;
  filters?: IInputsFilterParams;
  analysisId: string;
  projectId: string;
  phaseId?: string;
  generatedAt?: string;
  backgroundTaskId: string;
}) => {
  const [search] = useSearchParams();
  const { data: task } = useAnalysisBackgroundTask(
    analysisId,
    backgroundTaskId,
    true
  );

  const isLoading =
    task?.data.attributes.state === 'queued' ||
    task?.data.attributes.state === 'in_progress';

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
    </div>
  );
};

export default InsightBody;
