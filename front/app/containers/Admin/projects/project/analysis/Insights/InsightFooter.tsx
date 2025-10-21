import React from 'react';

import {
  Box,
  colors,
  Text,
  Icon,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { timeAgo } from 'utils/dateUtils';

import messages from './messages';

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
  customFieldIds,
}: {
  filters?: IInputsFilterParams;
  generatedAt?: string;
  analysisId: string;
  projectId: string;
  phaseId?: string;
  customFieldIds?: {
    additional_custom_field_ids?: string[];
    main_custom_field_id: string | null;
  };
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

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const additionalCustomFieldIds =
    customFieldIds?.additional_custom_field_ids || [];
  const mainCustomFieldId = customFieldIds?.main_custom_field_id;
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
    >
      <Tooltip
        content={formatMessage(messages.tooltipTextLimit)}
        disabled={largeSummariesAllowed}
      >
        <Box display="flex" gap="4px" alignItems="center">
          {largeSummariesAllowed ? (
            <Icon
              name="comment"
              width="12px"
              height="12px"
              fill={colors.textPrimary}
              transform="scaleX(-1)"
            />
          ) : (
            <Icon name="alert-circle" fill={colors.orange500} />
          )}

          <Text
            m="0px"
            fontSize="s"
            color={largeSummariesAllowed ? 'textPrimary' : 'orange500'}
            display="flex"
          >
            {filteredInputCount} / {totalInputCount}
          </Text>
        </Box>
      </Tooltip>

      {mainCustomFieldId && additionalCustomFieldIds.length > 0 && (
        <Tooltip
          zIndex={99999}
          content={
            <Box p="12px">
              {formatMessage(messages.additionalCustomFields)}
              <ul>
                <li>
                  <CustomFieldTitle
                    customFieldId={mainCustomFieldId}
                    projectId={projectId}
                    phaseId={phaseId}
                  />
                </li>
                {additionalCustomFieldIds.map((customFieldId) => (
                  <li key={customFieldId}>
                    <CustomFieldTitle
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
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="page"
              width="20px"
              height="20px"
              fill={colors.textPrimary}
            />
            <Text m="0px" fontSize="s">
              {`${additionalCustomFieldIds.length + 1}`}
            </Text>
          </Box>
        </Tooltip>
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
