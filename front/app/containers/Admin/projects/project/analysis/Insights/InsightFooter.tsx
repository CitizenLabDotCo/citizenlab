import React from 'react';
import { Box, colors, Text, Icon } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from './messages';

import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { timeAgo } from 'utils/dateUtils';
import useLocale from 'hooks/useLocale';
import Tippy from '@tippyjs/react';

const InsightFooter = ({
  filters,
  generatedAt,
  analysisId,
}: {
  filters?: IInputsFilterParams;
  generatedAt?: string;
  analysisId: string;
}) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId,
  });

  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const totalInputCount = inputs?.pages[0].meta.filtered_count || 0;
  const filteredInputCount = filteredInputs?.pages[0].meta.filtered_count || 0;

  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      pr="16px"
    >
      <Tippy
        content={formatMessage(messages.tooltipTextLimit)}
        disabled={largeSummariesEnabled}
      >
        <Box display="flex" gap="4px" alignItems="center">
          {!largeSummariesEnabled ? (
            <Icon name="alert-circle" fill={colors.orange} />
          ) : (
            <Icon
              name="comment"
              width="12px"
              height="12px"
              fill={colors.black}
              transform="scaleX(-1)"
            />
          )}

          <Text
            m="0px"
            fontSize="s"
            color={!largeSummariesEnabled ? 'orange' : 'textPrimary'}
            display="flex"
          >
            {filteredInputCount} / {totalInputCount}
          </Text>
        </Box>
      </Tippy>

      {generatedAt && (
        <Text m="0px" fontSize="s">
          {timeAgo(Date.parse(generatedAt), locale)}
        </Text>
      )}
    </Box>
  );
};

export default InsightFooter;
