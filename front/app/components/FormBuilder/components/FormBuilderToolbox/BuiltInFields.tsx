import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { Drop } from 'components/FormBuilder/components/DragAndDrop';
import { fieldAreaDNDType } from 'components/FormBuilder/components/FormFields/constants';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ToolboxItem from './ToolboxItem';

interface BuiltInFieldsProps {
  builderConfig: FormBuilderConfig;
}

const BuiltInFields = ({ builderConfig }: BuiltInFieldsProps) => {
  const cosponsorsEnabled = useFeatureFlag({ name: 'input_cosponsorship' });
  const { watch } = useFormContext();
  const { formatMessage } = useIntl();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const enabledBuiltInFieldKeys = formCustomFields
    .filter((field) => {
      return builderConfig.builtInFields.includes(field.key) && !field.enabled;
    })
    .map((builtInField) => {
      return builtInField.key;
    });

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
      <Drop id="toolbox-builtin" type={fieldAreaDNDType}>
        {builderConfig.builtInFields.includes('idea_images_attributes') && (
          <ToolboxItem
            icon="image"
            label={formatMessage(messages.inputImages)}
            disabled={
              !enabledBuiltInFieldKeys.includes('idea_images_attributes')
            }
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-idea-images-attributes-item"
            dragId="toolbox-idea_images_attributes"
            dragIndex={0}
          />
        )}
        {builderConfig.builtInFields.includes('proposed_budget') && (
          <ToolboxItem
            icon="money-bag"
            label={formatMessage(messages.proposedBudget)}
            disabled={!enabledBuiltInFieldKeys.includes('proposed_budget')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-proposed-budget-item"
            dragId="toolbox-proposed_budget"
            dragIndex={1}
          />
        )}
        {builderConfig.builtInFields.includes('idea_files_attributes') && (
          <ToolboxItem
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            disabled={
              !enabledBuiltInFieldKeys.includes('idea_files_attributes')
            }
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-attachments-item"
            dragId="toolbox-idea_files_attributes"
            dragIndex={2}
          />
        )}
        {builderConfig.builtInFields.includes('location_description') && (
          <ToolboxItem
            icon="location-simple"
            label={formatMessage(messages.locationDescription)}
            disabled={!enabledBuiltInFieldKeys.includes('location_description')}
            data-cy="e2e-location_description-item"
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            dragId="toolbox-location_description"
            dragIndex={3}
          />
        )}
        {builderConfig.builtInFields.includes('topic_ids') && (
          <ToolboxItem
            icon="label"
            label={formatMessage(messages.tags)}
            disabled={!enabledBuiltInFieldKeys.includes('topic_ids')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-topic_ids-item"
            dragId="toolbox-topic_ids"
            dragIndex={4}
          />
        )}
        {builderConfig.builtInFields.includes('cosponsor_ids') &&
          cosponsorsEnabled && (
            <ToolboxItem
              icon="volunteer"
              label={formatMessage(messages.cosponsors)}
              data-cy="e2e-cosponsors-field"
              fieldsToInclude={builderConfig.toolboxFieldsToInclude}
              inputType="cosponsor_ids"
              disabled={!enabledBuiltInFieldKeys.includes('cosponsor_ids')}
              disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
              dragId="toolbox-cosponsor_ids"
              dragIndex={5}
            />
          )}
      </Drop>
    </Box>
  );
};

export default BuiltInFields;
