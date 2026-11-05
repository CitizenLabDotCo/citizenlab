import React from 'react';

import {
  Box,
  IconButton,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import messages from './messages';

type Props = {
  filterKey: string;
  isEditable: boolean;
  analysisId: string;
};

// Chip for the `input_follow_up_not_empty` filter. Unlike `input_custom_<id>`
// filters, this one carries no field id, so the focused question is resolved
// from the analysis's main custom field (the sentiment question) to render
// "Question {n}: Has follow-up text".
const FollowUpFilterItem = ({ filterKey, isEditable, analysisId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: analysis } = useAnalysis(analysisId);

  const mainCustomFieldId =
    analysis?.data.relationships.main_custom_field?.data?.id;
  const projectId = analysis?.data.relationships.project?.data?.id;
  const phaseId = analysis?.data.relationships.phase?.data?.id;

  const containerId: { projectId?: string; phaseId?: string } = {};
  if (projectId) {
    containerId.projectId = projectId;
  } else {
    containerId.phaseId = phaseId;
  }

  const { data: customField } = useIdeaCustomField({
    customFieldId: mainCustomFieldId,
    ...containerId,
  });

  if (!customField) return null;

  return (
    <Box
      py="4px"
      px="8px"
      borderRadius={stylingConsts.borderRadius}
      borderColor={colors.success}
      borderWidth="1px"
      borderStyle="solid"
      bgColor={colors.white}
      color={colors.success}
      display="flex"
    >
      <Box>Question {customField.data.attributes.ordering}:</Box>
      <Box ml="3px">{formatMessage(messages.followUpNotEmpty)}</Box>
      {isEditable && (
        <IconButton
          iconName="close"
          iconColor={colors.success}
          iconColorOnHover={colors.success}
          iconWidth="16px"
          iconHeight="16px"
          onClick={() => {
            removeSearchParams([filterKey]);
          }}
          a11y_buttonActionMessage={formatMessage(messages.removeFilter)}
        />
      )}
    </Box>
  );
};

export default FollowUpFilterItem;
