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
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';
import useLocalize from 'hooks/useLocalize';

const CustomFieldTitle = ({ customFieldId, projectId, phaseId }) => {
  const localize = useLocalize();
  const containerId: { projectId?: string; phaseId?: string } = {};
  if (phaseId) {
    containerId.phaseId = phaseId;
  } else {
    containerId.projectId = projectId;
  }
  const { data: customField } = useIdeaCustomField({
    customFieldId,
    ...containerId,
  });

  return <>{localize(customField?.data.attributes.title_multiloc)}</>;
};

const InsightFooter = ({
  filters,
  generatedAt,
  analysisId,
  projectId,
  phaseId,
  additionalCustomFieldsIds,
}: {
  filters?: IInputsFilterParams;
  generatedAt?: string;
  analysisId: string;
  projectId: string;
  phaseId?: string;
  additionalCustomFieldsIds?: string[];
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

      {additionalCustomFieldsIds && (
        <Tippy
          content={
            <Box p="12px">
              {formatMessage(messages.additionalCustomFields)}
              <ul>
                {additionalCustomFieldsIds?.map((customFieldId) => (
                  <li key={customFieldId}>
                    <CustomFieldTitle
                      key={customFieldId}
                      customFieldId={customFieldId}
                      projectId={projectId}
                      phaseId={phaseId}
                    />
                  </li>
                ))}
              </ul>
            </Box>
          }
        >
          <Box>
            <Icon name="page" />
          </Box>
        </Tippy>
      )}

      {generatedAt && (
        <Text m="0px" fontSize="s">
          {timeAgo(Date.parse(generatedAt), locale)}
        </Text>
      )}
    </Box>
  );
};

export default InsightFooter;
