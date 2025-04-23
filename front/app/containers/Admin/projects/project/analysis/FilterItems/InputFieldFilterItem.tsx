import React from 'react';

import {
  Box,
  IconButton,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAnalysis from 'api/analyses/useAnalysis';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import ShortFieldValue from '../components/ShortInputFieldValue';

import EllipsisFilterValue from './EllipsisFilterValue';
import messages from './messages';

type Props = {
  customFieldId: string;
  filterKey: string;
  filterValue: any;
  isEditable: boolean;
  predicate: '<' | '>' | '=';
};

const InputFieldFilterItem = ({
  customFieldId,
  filterKey,
  filterValue,
  isEditable = true,
  predicate,
}: Props) => {
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const projectId = analysis?.data.relationships.project?.data?.id;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const phaseId = analysis?.data.relationships.phase?.data?.id;
  const containerId: { projectId?: string; phaseId?: string } = {};
  if (projectId) {
    containerId.projectId = projectId;
  } else {
    containerId.phaseId = phaseId;
  }
  const { data: customField } = useIdeaCustomField({
    customFieldId,
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
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      <Box>Question {customField?.data.attributes.ordering}</Box>
      <Box mx="3px">{predicate}</Box>
      <EllipsisFilterValue>
        {Array.isArray(filterValue) &&
          customField.data.attributes.input_type !== 'multiselect' &&
          customField.data.attributes.input_type !== 'multiselect_image' &&
          filterValue.map((filterItem, index) => (
            <>
              {index !== 0 && ', '}
              <ShortFieldValue
                key={filterItem}
                customField={customField}
                rawValue={filterItem}
              />
            </>
          ))}
        {(!Array.isArray(filterValue) ||
          customField.data.attributes.input_type === 'multiselect' ||
          customField.data.attributes.input_type === 'multiselect_image') && (
          <ShortFieldValue customField={customField} rawValue={filterValue} />
        )}
      </EllipsisFilterValue>
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

export default InputFieldFilterItem;
