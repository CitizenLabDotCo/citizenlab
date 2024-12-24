import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';

import {
  ICustomFieldInputType,
  IFlatCreateCustomField,
  IFlatCustomField,
} from 'api/custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import {
  generateTempId,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import BuiltInFields from './BuiltInFields';
import LayoutFields from './LayoutFields';
import ToolboxItem from './ToolboxItem';

interface FormBuilderToolboxProps {
  onAddField: (field: IFlatCreateCustomField, index: number) => void;
  builderConfig: FormBuilderConfig;
  move: (indexA: number, indexB: number) => void;
}

const FormBuilderToolbox = ({
  onAddField,
  builderConfig,
  move,
}: FormBuilderToolboxProps) => {
  const isInputFormCustomFieldsFlagEnabled = useFeatureFlag({
    name: 'input_form_custom_fields',
  });

  const isFormMappingEnabled = useFeatureFlag({
    name: 'form_mapping',
  });

  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const isCustomFieldsDisabled =
    !isInputFormCustomFieldsFlagEnabled &&
    !builderConfig.alwaysShowCustomFields;
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const customToolBoxTitle = get(
    builderConfig,
    'toolboxTitle',
    messages.content
  );

  if (isNilOrError(locale)) return null;

  const addField = (inputType: ICustomFieldInputType) => {
    const index = !isNilOrError(formCustomFields) ? formCustomFields.length : 0;
    onAddField(
      {
        id: `${Math.floor(Date.now() * Math.random())}`,
        temp_id: generateTempId(),
        logic: {
          ...(inputType !== 'page' ? { rules: [] } : undefined),
        },
        isLocalOnly: true,
        description_multiloc: {},
        input_type: inputType,
        required: false,
        title_multiloc: {
          [locale]: '',
        },
        linear_scale_label_1_multiloc: {},
        linear_scale_label_2_multiloc: {},
        linear_scale_label_3_multiloc: {},
        linear_scale_label_4_multiloc: {},
        linear_scale_label_5_multiloc: {},
        linear_scale_label_6_multiloc: {},
        linear_scale_label_7_multiloc: {},
        maximum: 5,
        options: [
          {
            title_multiloc: {},
          },
        ],
        enabled: true,
      },
      index
    );
  };

  return (
    <Box
      position="fixed"
      zIndex="99999"
      flex="0 0 auto"
      h="100%"
      w="210px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgColor="white"
      overflowX="visible"
      borderRight={`1px solid ${colors.borderLight}`}
      pb="80px"
    >
      <Box overflowY="auto" w="100%" display="inline">
        <LayoutFields addField={addField} builderConfig={builderConfig} />
        {builderConfig.displayBuiltInFields && (
          <BuiltInFields move={move} builderConfig={builderConfig} />
        )}
        <Box display="flex" alignItems="center" ml="16px" mt="16px">
          <Title
            variant="h6"
            m="0px"
            as="h3"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            <FormattedMessage {...customToolBoxTitle} />
          </Title>
          {!builderConfig.alwaysShowCustomFields && (
            <IconTooltip
              icon={isCustomFieldsDisabled ? 'info-outline' : 'info-solid'}
              iconColor={
                isCustomFieldsDisabled ? colors.coolGrey300 : colors.coolGrey500
              }
              placement="right-start"
              ml="4px"
              content={
                <Box>
                  <Text my="4px" color="white" fontSize="s">
                    {isCustomFieldsDisabled
                      ? formatMessage(messages.disabledCustomFieldsTooltip)
                      : formatMessage(messages.fieldIsNotVisibleTooltip)}
                  </Text>
                </Box>
              }
            />
          )}
        </Box>
        <ToolboxItem
          icon="survey-short-answer-2"
          label={formatMessage(messages.shortAnswer)}
          onClick={() => addField('text')}
          data-cy="e2e-short-answer"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="text"
          disabled={isCustomFieldsDisabled}
          showAIUpsell
        />
        <ToolboxItem
          icon="survey-long-answer-2"
          label={formatMessage(messages.longAnswer)}
          onClick={() => addField('multiline_text')}
          data-cy="e2e-long-answer"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="multiline_text"
          disabled={isCustomFieldsDisabled}
          showAIUpsell
        />
        <ToolboxItem
          icon="survey-single-choice"
          label={formatMessage(messages.singleChoice)}
          onClick={() => addField('select')}
          data-cy="e2e-single-choice"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="select"
          disabled={isCustomFieldsDisabled}
        />
        <ToolboxItem
          icon="survey-multiple-choice-2"
          label={formatMessage(messages.multipleChoice)}
          onClick={() => addField('multiselect')}
          data-cy="e2e-multiple-choice"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="multiselect"
          disabled={isCustomFieldsDisabled}
        />
        <ToolboxItem
          icon="image"
          label={formatMessage(messages.multipleChoiceImage)}
          onClick={() => addField('multiselect_image')}
          data-cy="e2e-image-choice"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="multiselect_image"
          disabled={isCustomFieldsDisabled}
        />
        <ToolboxItem
          icon="survey-linear-scale"
          label={formatMessage(messages.linearScale)}
          onClick={() => addField('linear_scale')}
          data-cy="e2e-linear-scale"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="linear_scale"
          disabled={isCustomFieldsDisabled}
        />
        <ToolboxItem
          icon="survey-number-field"
          label={formatMessage(messages.number)}
          onClick={() => addField('number')}
          data-cy="e2e-number-field"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="number"
          disabled={isCustomFieldsDisabled}
        />
        <ToolboxItem
          icon="upload-file"
          label={formatMessage(messages.fileUpload)}
          onClick={() => addField('file_upload')}
          data-cy="e2e-file-upload-field"
          fieldsToExclude={builderConfig.toolboxFieldsToExclude}
          inputType="file_upload"
          disabled={isCustomFieldsDisabled}
        />
        <Box>
          {!builderConfig.toolboxFieldsToExclude.includes('point') && ( // We want to show the mapping section
            <>
              <Title
                ml="16px"
                mt="16px"
                variant="h6"
                m="0px"
                as="h3"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {formatMessage(messages.mapping)}
              </Title>
              <ToolboxItem
                icon="dropPin"
                label={formatMessage(messages.dropPin)}
                onClick={() => addField('point')}
                data-cy="e2e-point-field"
                fieldsToExclude={builderConfig.toolboxFieldsToExclude}
                inputType="point"
                disabled={!isFormMappingEnabled}
                disabledTooltipMessage={messages.mappingNotInCurrentLicense}
              />
              <>
                <ToolboxItem
                  icon="drawRoute"
                  label={formatMessage(messages.drawRoute)}
                  onClick={() => addField('line')}
                  data-cy="e2e-line-field"
                  fieldsToExclude={builderConfig.toolboxFieldsToExclude}
                  inputType="line"
                  disabled={!isFormMappingEnabled}
                  disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                />
                <ToolboxItem
                  icon="drawPolygon"
                  label={formatMessage(messages.drawArea)}
                  onClick={() => addField('polygon')}
                  data-cy="e2e-polygon-field"
                  fieldsToExclude={builderConfig.toolboxFieldsToExclude}
                  inputType="polygon"
                  disabled={!isFormMappingEnabled}
                  disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                />
                <ToolboxItem
                  icon="upload-file"
                  label={formatMessage(messages.shapefileUpload)}
                  onClick={() => addField('shapefile_upload')}
                  data-cy="e2e-file-shapefile-field"
                  fieldsToExclude={builderConfig.toolboxFieldsToExclude}
                  inputType="shapefile_upload"
                  disabled={!isFormMappingEnabled}
                  disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                />
              </>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FormBuilderToolbox;
