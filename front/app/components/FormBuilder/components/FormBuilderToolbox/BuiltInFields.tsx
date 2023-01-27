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
import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'services/formCustomFields';

// utils
import {
  builtInFieldKeys,
  BuiltInKeyType,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';
import { DraggableElement } from './utils';

interface BuiltInFieldsProps {
  isEditingDisabled: boolean;
  move: (indexA: number, indexB: number) => void;
  addField: (inputType: ICustomFieldInputType) => void;
  builderConfig: FormBuilderConfig;
}

const BuiltInFields = ({
  intl: { formatMessage },
  isEditingDisabled,
  move,
  addField,
  builderConfig,
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

  const enableField = (key: BuiltInKeyType) => {
    if (isEditingDisabled || !enabledBuiltInFieldKeys.includes(key)) {
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
      <DraggableElement>
        <ToolboxItem
          icon="money-bag"
          label={formatMessage(messages.proposedBudget)}
          onClick={() => enableField('proposed_budget')}
          disabled={!enabledBuiltInFieldKeys.includes('proposed_budget')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        />
        <ToolboxItem
          icon="upload-file"
          label={formatMessage(messages.fileUpload)}
          onClick={() => enableField('idea_files_attributes')}
          disabled={!enabledBuiltInFieldKeys.includes('idea_files_attributes')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        />
        <ToolboxItem
          icon="location-simple"
          label={formatMessage(messages.locationDescription)}
          onClick={() => enableField('location_description')}
          disabled={!enabledBuiltInFieldKeys.includes('location_description')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        />
        <ToolboxItem
          icon="label"
          label={formatMessage(messages.tags)}
          onClick={() => enableField('topic_ids')}
          disabled={!enabledBuiltInFieldKeys.includes('topic_ids')}
          disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
        />
      </DraggableElement>
    </Box>
  );
};

export default injectIntl(BuiltInFields);
