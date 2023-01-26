import React from 'react';
import { get } from 'lodash-es';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import ToolboxItem from './ToolboxItem';
import {
  Box,
  IconTooltip,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import BuiltInFields from './BuiltInFields';

// styles
import { colors } from 'utils/styleUtils';

// types
import {
  ICustomFieldInputType,
  IFlatCreateCustomField,
} from 'services/formCustomFields';

// Hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { generateTempId } from '../FormBuilderSettings/utils';
import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { DraggableElement } from './utils';
import useFeatureFlag from 'hooks/useFeatureFlag';

interface FormBuilderToolboxProps {
  onAddField: (field: IFlatCreateCustomField) => void;
  isEditingDisabled: boolean;
  builderConfig: FormBuilderConfig;
  move: (indexA: number, indexB: number) => void;
}

const FormBuilderToolbox = ({
  intl: { formatMessage },
  onAddField,
  isEditingDisabled,
  builderConfig,
  move,
}: FormBuilderToolboxProps & WrappedComponentProps) => {
  const isInputFormBuilderEnabled = useFeatureFlag({
    name: 'input_form_builder',
  });

  const locale = useLocale();

  const customToolBoxTitle = get(
    builderConfig,
    'toolboxTitle',
    messages.content
  );
  if (isNilOrError(locale)) return null;

  const addField = (inputType: ICustomFieldInputType) => {
    if (isEditingDisabled) {
      return;
    }

    onAddField({
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
      maximum_label_multiloc: {},
      minimum_label_multiloc: {},
      maximum: 5,
      options: [
        {
          title_multiloc: {},
        },
      ],
      enabled: true,
    });
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
        <BuiltInFields
          addField={addField}
          builderConfig={builderConfig}
          isEditingDisabled={isEditingDisabled}
          move={move}
        />
        <Box display="flex">
          <Title
            fontWeight="normal"
            mb="4px"
            ml="16px"
            variant="h6"
            as="h3"
            color="textSecondary"
            style={{ textTransform: 'uppercase' }}
          >
            <FormattedMessage {...customToolBoxTitle} />
          </Title>
          {!isInputFormBuilderEnabled && !builderConfig.alwaysShowCustomFields && (
            <IconTooltip
              ml="4px"
              mt="8px"
              icon="info-outline"
              iconColor={colors.coolGrey300}
              py="0px"
              content={
                <Box>
                  <Text my="4px" color="white" fontSize="s">
                    {formatMessage(messages.disabledCustomFieldsTooltip)}
                  </Text>
                </Box>
              }
            />
          )}
        </Box>

        <DraggableElement>
          {builderConfig.groupingType === 'page' && (
            <ToolboxItem
              icon="page"
              label={formatMessage(messages.page)}
              onClick={() => addField('page')}
              data-cy="e2e-page"
              fieldsToExclude={builderConfig.toolboxFieldsToExclude}
              inputType="page"
            />
          )}
          <ToolboxItem
            icon="survey-short-answer-2"
            label={formatMessage(messages.shortAnswer)}
            onClick={() => addField('text')}
            data-cy="e2e-short-answer"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="text"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="survey-long-answer-2"
            label={formatMessage(messages.longAnswer)}
            onClick={() => addField('multiline_text')}
            data-cy="e2e-long-answer"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="multiline_text"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="survey-single-choice"
            label={formatMessage(messages.singleChoice)}
            onClick={() => addField('select')}
            data-cy="e2e-single-choice"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="select"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="survey-multiple-choice-2"
            label={formatMessage(messages.multipleChoice)}
            onClick={() => addField('multiselect')}
            data-cy="e2e-multiple-choice"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="multiselect"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="survey-linear-scale"
            label={formatMessage(messages.linearScale)}
            onClick={() => addField('linear_scale')}
            data-cy="e2e-linear-scale"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="linear_scale"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="survey-number-field"
            label={formatMessage(messages.number)}
            onClick={() => addField('number')}
            data-cy="e2e-number-field"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="number"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
          <ToolboxItem
            icon="upload-file"
            label={formatMessage(messages.fileUpload)}
            onClick={() => addField('file_upload')}
            data-cy="e2e-file-upload-field"
            fieldsToExclude={builderConfig.toolboxFieldsToExclude}
            inputType="file_upload"
            disabled={
              !isInputFormBuilderEnabled &&
              !builderConfig.alwaysShowCustomFields
            }
          />
        </DraggableElement>
      </Box>
    </Box>
  );
};

export default injectIntl(FormBuilderToolbox);
