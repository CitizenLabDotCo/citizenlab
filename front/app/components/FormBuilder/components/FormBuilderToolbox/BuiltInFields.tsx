import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import {
  IFlatCustomField,
  ICustomFieldInputType,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

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
  addField: (inputType: ICustomFieldInputType) => void;
  onSelectField: (field: IFlatCustomFieldWithIndex) => void;
}

const BuiltInFields = ({
  move,
  builderConfig,
  addField,
  onSelectField,
}: BuiltInFieldsProps) => {
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

    const fields = formCustomFields;
    const fieldsLength = fields.length;
    const fieldIndex = fields.findIndex((f) => f.key === key);
    if (fieldIndex === -1) return;
    const field = fields[fieldIndex];
    const updatedField = { ...field, enabled: true };
    setValue(`customFields.${fieldIndex}`, updatedField);

    const previousField = fields[fieldsLength - 2];
    const isLastFieldTitleOrBody =
      previousField.key === 'title_multiloc' ||
      previousField.key === 'body_multiloc';

    if (isLastFieldTitleOrBody) {
      // We add a page and the move the enabled field to the end
      addField('page');
      const targetIndex = fieldsLength - 1;
      move(fieldIndex, targetIndex);
      onSelectField({ ...updatedField, index: targetIndex });
    } else {
      const targetIndex = fieldsLength - 2;
      move(fieldIndex, targetIndex);
      onSelectField({ ...updatedField, index: targetIndex });
    }

    trigger();
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
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="cosponsor_ids"
            disabled={!enabledBuiltInFieldKeys.includes('cosponsor_ids')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
          />
        )}
    </Box>
  );
};

export default BuiltInFields;
