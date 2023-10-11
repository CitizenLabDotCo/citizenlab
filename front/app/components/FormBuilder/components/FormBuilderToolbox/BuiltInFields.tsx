import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// types
import { IFlatCustomField } from 'api/custom_fields/types';

// utils
import { builtInFieldKeys, BuiltInKeyType } from 'components/FormBuilder/utils';

interface BuiltInFieldsProps {
  move: (indexA: number, indexB: number) => void;
}

const BuiltInFields = ({ move }: BuiltInFieldsProps) => {
  const { watch, trigger, setValue } = useFormContext();
  const { formatMessage } = useIntl();

  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const enabledBuiltInFieldKeys = formCustomFields
    .filter((field) => {
      return builtInFieldKeys.includes(field.key) && !field.enabled;
    })
    .map((builtInField) => {
      return builtInField.key;
    });

  const enableField = (key: BuiltInKeyType) => {
    if (!enabledBuiltInFieldKeys.includes(key)) {
      return;
    }

    const field = formCustomFields.find((field) => field.key === key);
    const fieldIndex = formCustomFields.findIndex((field) => field.key === key);
    if (field) {
      const updatedField = { ...field, enabled: true };
      setValue(`customFields.${fieldIndex}`, updatedField);
      move(fieldIndex, formCustomFields.length - 1);
      trigger();
    }
  };

  return (
    <Box w="100%" display="inline">
      <Title
        fontWeight="normal"
        mb="4px"
        ml="16px"
        variant="h6"
        as="h3"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        <FormattedMessage {...messages.defaultContent} />
      </Title>
      <ToolboxItem
        icon="money-bag"
        label={formatMessage(messages.proposedBudget)}
        onClick={() => enableField('proposed_budget')}
        disabled={!enabledBuiltInFieldKeys.includes('proposed_budget')}
        disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        data-cy="e2e-proposed-budget-item"
      />
      <ToolboxItem
        icon="upload-file"
        label={formatMessage(messages.fileUpload)}
        onClick={() => enableField('idea_files_attributes')}
        disabled={!enabledBuiltInFieldKeys.includes('idea_files_attributes')}
        disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        data-cy="e2e-attachments-item"
      />
      <ToolboxItem
        icon="location-simple"
        label={formatMessage(messages.locationDescription)}
        onClick={() => enableField('location_description')}
        disabled={!enabledBuiltInFieldKeys.includes('location_description')}
        data-cy="e2e-location-item"
        disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
      />
      <ToolboxItem
        icon="label"
        label={formatMessage(messages.tags)}
        onClick={() => enableField('topic_ids')}
        disabled={!enabledBuiltInFieldKeys.includes('topic_ids')}
        disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        data-cy="e2e-tags-item"
      />
    </Box>
  );
};

export default BuiltInFields;
