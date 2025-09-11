import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { FormBuilderConfig } from 'components/FormBuilder/utils';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import BuiltInFields from './BuiltInFields';
import ToolboxItem from './ToolboxItem';
import LayoutFields from './LayoutFields';
import { Drop } from '../DragAndDrop';
import { fieldAreaDNDType } from '../FormFields/constants';

interface FormBuilderToolboxProps {
  builderConfig: FormBuilderConfig;
}

const FormBuilderToolbox = ({ builderConfig }: FormBuilderToolboxProps) => {
  const isInputFormCustomFieldsFlagEnabled = useFeatureFlag({
    name: 'input_form_custom_fields',
  });

  const isFormMappingEnabled = useFeatureFlag({
    name: 'form_mapping',
  });

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
      data-cy="e2e-form-builder-toolbox"
    >
      <Box overflowY="auto" w="100%" display="inline">
        <LayoutFields builderConfig={builderConfig} />
        {builderConfig.displayBuiltInFields && (
          <BuiltInFields builderConfig={builderConfig} />
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
        <Drop id="toolbox" type={fieldAreaDNDType}>
          <ToolboxItem
            dragIndex={0}
            icon="survey-short-answer-2"
            label={formatMessage(messages.shortAnswer)}
            data-cy="e2e-short-answer"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="text"
            disabled={isCustomFieldsDisabled}
            showAIUpsell
            dragId="toolbox_text"
          />
          <ToolboxItem
            dragIndex={1}
            icon="survey-long-answer-2"
            label={formatMessage(messages.longAnswer)}
            data-cy="e2e-long-answer"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="multiline_text"
            disabled={isCustomFieldsDisabled}
            showAIUpsell
            dragId="toolbox_multiline_text"
          />
          <ToolboxItem
            dragIndex={2}
            icon="survey-single-choice"
            label={formatMessage(messages.singleChoice)}
            data-cy="e2e-single-choice"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="select"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_select"
          />
          <ToolboxItem
            dragIndex={3}
            icon="survey-multiple-choice-2"
            label={formatMessage(messages.multipleChoice)}
            data-cy="e2e-multiple-choice"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="multiselect"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_multiselect"
          />
          <ToolboxItem
            dragIndex={4}
            icon="image"
            label={formatMessage(messages.multipleChoiceImage)}
            data-cy="e2e-image-choice"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="multiselect_image"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_multiselect_image"
          />
          <ToolboxItem
            dragIndex={5}
            icon="survey-linear-scale"
            label={formatMessage(messages.linearScale)}
            data-cy="e2e-linear-scale"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="linear_scale"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_linear_scale"
          />
          <ToolboxItem
            dragIndex={6}
            icon="survey-ranking"
            label={formatMessage(messages.ranking)}
            data-cy="e2e-ranking"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="ranking"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_ranking"
          />
          <ToolboxItem
            dragIndex={7}
            icon="rating"
            label={formatMessage(messages.rating)}
            data-cy="e2e-rating"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="rating"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_rating"
          />
          <ToolboxItem
            dragIndex={8}
            icon="survey-sentiment"
            label={formatMessage(messages.sentiment)}
            data-cy="e2e-sentiment"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="sentiment_linear_scale"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_sentiment_linear_scale"
          />
          <ToolboxItem
            dragIndex={9}
            icon="survey-matrix"
            label={formatMessage(messages.matrix)}
            data-cy="e2e-matrix"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="matrix_linear_scale"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_matrix_linear_scale"
          />

          <ToolboxItem
            dragIndex={10}
            icon="survey-number-field"
            label={formatMessage(messages.number)}
            data-cy="e2e-number-field"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="number"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_number"
          />
          <ToolboxItem
            dragIndex={11}
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            data-cy="e2e-file-upload-field"
            fieldsToInclude={builderConfig.toolboxFieldsToInclude}
            inputType="file_upload"
            disabled={isCustomFieldsDisabled}
            dragId="toolbox_file_upload"
          />
        </Drop>
        <Box>
          {builderConfig.toolboxFieldsToInclude.includes('point') && ( // We want to show the mapping section
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
              <Drop id="toolbox_mapping" type={fieldAreaDNDType}>
                <ToolboxItem
                  dragIndex={0}
                  icon="dropPin"
                  label={formatMessage(messages.dropPin)}
                  data-cy="e2e-point-field"
                  fieldsToInclude={builderConfig.toolboxFieldsToInclude}
                  inputType="point"
                  disabled={!isFormMappingEnabled}
                  disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                  dragId="toolbox_point"
                />
                <>
                  <ToolboxItem
                    dragIndex={1}
                    icon="drawRoute"
                    label={formatMessage(messages.drawRoute)}
                    data-cy="e2e-line-field"
                    fieldsToInclude={builderConfig.toolboxFieldsToInclude}
                    inputType="line"
                    disabled={!isFormMappingEnabled}
                    disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                    dragId="toolbox_line"
                  />
                  <ToolboxItem
                    dragIndex={2}
                    icon="drawPolygon"
                    label={formatMessage(messages.drawArea)}
                    data-cy="e2e-polygon-field"
                    fieldsToInclude={builderConfig.toolboxFieldsToInclude}
                    inputType="polygon"
                    disabled={!isFormMappingEnabled}
                    disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                    dragId="toolbox_polygon"
                  />
                  <ToolboxItem
                    dragIndex={3}
                    icon="upload-file"
                    label={formatMessage(messages.shapefileUpload)}
                    data-cy="e2e-file-shapefile-field"
                    fieldsToInclude={builderConfig.toolboxFieldsToInclude}
                    inputType="shapefile_upload"
                    disabled={!isFormMappingEnabled}
                    disabledTooltipMessage={messages.mappingNotInCurrentLicense}
                    dragId="toolbox_shapefile_upload"
                  />
                </>
              </Drop>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FormBuilderToolbox;
