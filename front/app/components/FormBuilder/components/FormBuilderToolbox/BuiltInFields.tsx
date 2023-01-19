import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ToolboxItem from './ToolboxItem';
import { Box, Title } from '@citizenlab/cl2-component-library';

// types
import { IFlatCustomField } from 'services/formCustomFields';

// utils
import { builtInFieldKeys, BuiltInKeyType } from 'components/FormBuilder/utils';
import { DraggableElement } from './utils';

interface BuiltInFieldsProps {
  isEditingDisabled: boolean;
  move: (indexA: number, indexB: number) => void;
}

const BuiltInFields = ({
  intl: { formatMessage },
  isEditingDisabled,
  move,
}: BuiltInFieldsProps & WrappedComponentProps) => {
  const { watch, trigger, setValue } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const enabledBuiltInFieldKeys = formCustomFields
    .filter((field) => {
      return builtInFieldKeys.includes(field.key) && !field.enabled;
    })
    .map((builtInField) => {
      return builtInField.key;
    });
  const hasDisabledFields = enabledBuiltInFieldKeys.length > 0;

  if (!hasDisabledFields) return null;

  const enableField = (key: BuiltInKeyType) => {
    if (isEditingDisabled) {
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
        mt="24px"
        ml="16px"
        variant="h6"
        as="h3"
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        <FormattedMessage {...messages.defaultField} />
      </Title>

      {enabledBuiltInFieldKeys.includes('proposed_budget') && (
        <DraggableElement>
          <ToolboxItem
            icon="money-bag"
            label={formatMessage(messages.proposedBudget)}
            onClick={() => enableField('proposed_budget')}
          />
        </DraggableElement>
      )}
      {enabledBuiltInFieldKeys.includes('idea_files_attributes') && (
        <DraggableElement>
          <ToolboxItem
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            onClick={() => enableField('idea_files_attributes')}
          />
        </DraggableElement>
      )}
      {enabledBuiltInFieldKeys.includes('location_description') && (
        <DraggableElement>
          <ToolboxItem
            icon="location-simple"
            label={formatMessage(messages.locationDescription)}
            onClick={() => enableField('location_description')}
          />
        </DraggableElement>
      )}
      {enabledBuiltInFieldKeys.includes('topic_ids') && (
        <DraggableElement>
          <ToolboxItem
            icon="label"
            label={formatMessage(messages.tags)}
            onClick={() => enableField('topic_ids')}
          />
        </DraggableElement>
      )}
    </Box>
  );
};

export default injectIntl(BuiltInFields);
