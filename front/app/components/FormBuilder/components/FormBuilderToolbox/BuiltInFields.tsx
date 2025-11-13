import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { Drop } from 'components/FormBuilder/components/DragAndDrop';
import { fieldAreaDNDType } from 'components/FormBuilder/components/FormFields/constants';
import { FormBuilderConfig } from 'components/FormBuilder/utils';

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
  const enabledBuiltInFieldCodes = builderConfig.builtInFields
    .filter((code) => {
      return !formCustomFields.some(
        (formField) => formField.code === code && formField.enabled
      );
    })
    .map((code) => code);

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
      <Drop id="toolbox_builtin" type={fieldAreaDNDType} isDropDisabled={true}>
        {builderConfig.builtInFields.includes('body_multiloc') && (
          <ToolboxItem
            icon="survey-long-answer-2"
            label={formatMessage(messages.bodyMultiloc)}
            disabled={!enabledBuiltInFieldCodes.includes('body_multiloc')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-body-multiloc-item"
            dragId="toolbox_body_multiloc"
            dragIndex={0}
          />
        )}
        {builderConfig.builtInFields.includes('idea_images_attributes') && (
          <ToolboxItem
            icon="image"
            label={formatMessage(messages.inputImages)}
            disabled={
              !enabledBuiltInFieldCodes.includes('idea_images_attributes')
            }
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-idea-images-attributes-item"
            dragId="toolbox_idea_images_attributes"
            dragIndex={1}
          />
        )}
        {builderConfig.builtInFields.includes('proposed_budget') && (
          <ToolboxItem
            icon="money-bag"
            label={formatMessage(messages.proposedBudget)}
            disabled={!enabledBuiltInFieldCodes.includes('proposed_budget')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-proposed-budget-item"
            dragId="toolbox_proposed_budget"
            dragIndex={2}
          />
        )}
        {builderConfig.builtInFields.includes('idea_files_attributes') && (
          <ToolboxItem
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            disabled={
              !enabledBuiltInFieldCodes.includes('idea_files_attributes')
            }
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-attachments-item"
            dragId="toolbox_idea_files_attributes"
            dragIndex={3}
          />
        )}
        {builderConfig.builtInFields.includes('location_description') && (
          <ToolboxItem
            icon="location-simple"
            label={formatMessage(messages.locationDescription)}
            disabled={
              !enabledBuiltInFieldCodes.includes('location_description')
            }
            data-cy="e2e-location_description-item"
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            dragId="toolbox_location_description"
            dragIndex={4}
          />
        )}
        {builderConfig.builtInFields.includes('topic_ids') && (
          <ToolboxItem
            icon="label"
            label={formatMessage(messages.tags)}
            disabled={!enabledBuiltInFieldCodes.includes('topic_ids')}
            disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
            data-cy="e2e-topic_ids-item"
            dragId="toolbox_topic_ids"
            dragIndex={5}
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
              disabled={!enabledBuiltInFieldCodes.includes('cosponsor_ids')}
              disabledTooltipMessage={messages.disabledBuiltInFieldTooltip}
              dragId="toolbox_cosponsor_ids"
              dragIndex={6}
            />
          )}
      </Drop>
    </Box>
  );
};

export default BuiltInFields;
