import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  BuiltInKeyType,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ToolboxItem from './ToolboxItem';

interface BuiltInFieldsProps {
  move: (indexA: number, indexB: number) => void;
  builderConfig: FormBuilderConfig;
}

const BuiltInFields = ({ move, builderConfig }: BuiltInFieldsProps) => {
  const cosponsorsEnabled = useFeatureFlag({ name: 'input_cosponsorship' });
  const { watch, trigger, setValue } = useFormContext();
  const { formatMessage } = useIntl();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const enabledBuiltInFieldKeys = formCustomFields
    .filter((field) => {
      return builderConfig.builtInFields.includes(field.key) && !field.enabled;
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
        mb="4px"
        ml="16px"
        variant="h6"
        as="h3"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        <FormattedMessage {...messages.defaultContent} />
      </Title>
      {builderConfig.builtInFields.includes('proposed_budget') && (
        <ToolboxItem
          icon="money-bag"
          label={formatMessage(messages.proposedBudget)}
          onClick={() => enableField('proposed_budget')}
          disabled={!enabledBuiltInFieldKeys.includes('proposed_budget')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
          data-cy="e2e-proposed-budget-item"
        />
      )}
      {builderConfig.builtInFields.includes('idea_files_attributes') && (
        <ToolboxItem
          icon="upload-file"
          label={formatMessage(messages.fileUpload)}
          onClick={() => enableField('idea_files_attributes')}
          disabled={!enabledBuiltInFieldKeys.includes('idea_files_attributes')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
          data-cy="e2e-attachments-item"
        />
      )}
      {builderConfig.builtInFields.includes('location_description') && (
        <ToolboxItem
          icon="location-simple"
          label={formatMessage(messages.locationDescription)}
          onClick={() => enableField('location_description')}
          disabled={!enabledBuiltInFieldKeys.includes('location_description')}
          data-cy="e2e-location-item"
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        />
      )}
      {builderConfig.builtInFields.includes('topic_ids') && (
        <ToolboxItem
          icon="label"
          label={formatMessage(messages.tags)}
          onClick={() => enableField('topic_ids')}
          disabled={!enabledBuiltInFieldKeys.includes('topic_ids')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
          data-cy="e2e-tags-item"
        />
      )}
      {builderConfig.builtInFields.includes('cosponsor_ids') &&
        cosponsorsEnabled && (
          <ToolboxItem
            icon="volunteer"
            label={formatMessage(messages.cosponsors)}
            onClick={() => enableField('cosponsor_ids')}
            data-cy="e2e-cosponsors-field"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="cosponsor_ids"
            disabled={!enabledBuiltInFieldKeys.includes('cosponsor_ids')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
          />
        )}
    </Box>
  );
};

export default BuiltInFields;
