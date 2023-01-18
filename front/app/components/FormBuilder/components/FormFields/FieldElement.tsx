import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import {
  getFieldBackgroundColor,
  getIndexForTitle,
  getIndexTitleColor,
  getLinearScaleOptions,
  getLinearScaleRule,
  getOptionRule,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';
import { isPageRuleValid, isRuleValid } from 'utils/yup/validateLogic';

// components
import {
  Box,
  Badge,
  Text,
  colors,
  Icon,
  IconNames,
} from '@citizenlab/cl2-component-library';
import T from 'components/T';
import { FlexibleRow } from '../FlexibleRow';
import { FieldRuleDisplay } from './FieldRuleDisplay';
import {
  FormBuilderConfig,
  builtInFieldKeys,
} from 'components/FormBuilder/utils';

// styling
import styled from 'styled-components';
import { rgba } from 'polished';

// hooks and services
import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import useLocale from 'hooks/useLocale';

const FormFieldsContainer = styled(Box)`
  &:hover {
    cursor: pointer;
    background: ${rgba(colors.tealLight, 0.2)};
  }
`;

type Props = {
  field: IFlatCustomField;
  isEditingDisabled: boolean;
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  getTranslatedFieldType: (field: IFlatCustomField) => MessageDescriptor;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
};

// TODO: Rename icons in component library to "form" for clarity
const getFieldIcon = (
  inputType: ICustomFieldInputType,
  key: string
): IconNames => {
  const switchKey = builtInFieldKeys.includes(key) ? key : inputType;
  switch (switchKey) {
    case 'text':
    case 'title_multiloc':
      return 'survey-short-answer-2';
    case 'multiline_text':
    case 'body_multiloc':
      return 'survey-long-answer-2';
    case 'multiselect':
      return 'survey-multiple-choice-2';
    case 'select':
      return 'survey-single-choice';
    case 'number':
      return 'survey-number-field';
    case 'linear_scale':
      return 'survey-linear-scale';
    case 'section':
      return 'section';
    case 'file_upload':
      return 'upload-file';
    case 'idea_images_attributes':
      return 'image';
    case 'location_description':
      return 'location-simple';
    default:
      return 'survey';
  }
};

export const FieldElement = (props: Props) => {
  const {
    field,
    isEditingDisabled,
    onEditField,
    getTranslatedFieldType,
    selectedFieldId,
    builderConfig,
  } = props;
  const {
    watch,
    formState: { errors },
    trigger,
  } = useFormContext();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const index = formCustomFields.findIndex((f) => f.id === field.id);

  const hasErrors = !!errors.customFields?.[index];
  const showLogicOnRow =
    field.input_type !== 'page' ? field.logic.rules : field.logic;
  const isFieldGrouping = ['page', 'section'].includes(field.input_type);
  let rowTitle: MessageDescriptor = messages.question;
  if (field.input_type === 'page') {
    rowTitle = messages.page;
  } else if (field.input_type === 'section') {
    rowTitle = messages.section;
  }

  const editFieldAndValidate = () => {
    onEditField({ ...field, index });
    trigger();
  };

  return (
    <FormFieldsContainer
      role={'button'}
      key={field.id}
      background={getFieldBackgroundColor(selectedFieldId, field, hasErrors)}
      onClick={() => {
        isEditingDisabled ? undefined : editFieldAndValidate();
      }}
      data-cy="e2e-field-row"
    >
      <FlexibleRow rowHeight={isFieldGrouping ? '50px' : '70px'}>
        <Box
          display="flex"
          justifyContent="space-between"
          className="expand"
          width="100%"
          ml={isFieldGrouping ? '8px' : '32px'}
        >
          <Box display="flex" alignItems="center" height="100%">
            <Box display="block">
              <Box>
                {hasErrors && (
                  <Icon
                    ml="28px"
                    width="20px"
                    fill={colors.error}
                    name="alert-circle"
                  />
                )}
                <Icon
                  ml={hasErrors ? '8px' : '28px'}
                  width="12px"
                  fill={getIndexTitleColor(field.input_type)}
                  name="sort"
                  pb="4px"
                />
                <Text
                  as="span"
                  color={getIndexTitleColor(field.input_type)}
                  fontSize="base"
                  mt="auto"
                  mb="auto"
                  fontWeight="bold"
                  mx="12px"
                >
                  <>
                    <FormattedMessage {...rowTitle} />
                    {getIndexForTitle(formCustomFields, field)}
                  </>
                </Text>
                <Text
                  as="span"
                  fontSize="base"
                  mt="auto"
                  mb="auto"
                  color="grey800"
                >
                  <T value={field.title_multiloc} />
                </Text>
              </Box>
              {showLogicOnRow && (
                <Box>
                  {field.input_type === 'select' &&
                    field.options &&
                    field.options.map((option) => {
                      return (
                        <Box key={option.id}>
                          <FieldRuleDisplay
                            isRuleValid={isRuleValid(
                              getOptionRule(option, field),
                              field.temp_id || field.id,
                              formCustomFields
                            )}
                            answerTitle={getTitleFromAnswerId(
                              field,
                              getOptionRule(option, field)?.if,
                              locale
                            )}
                            targetPage={getTitleFromPageId(
                              formCustomFields,
                              getOptionRule(option, field)?.goto_page_id,
                              formatMessage(
                                builderConfig.formEndPageLogicOption ||
                                  messages.formEnd
                              ),
                              formatMessage(messages.page)
                            )}
                          />
                        </Box>
                      );
                    })}
                  {field.input_type === 'linear_scale' &&
                    field.maximum &&
                    getLinearScaleOptions(field.maximum).map((option) => {
                      return (
                        <Box key={option.key}>
                          <FieldRuleDisplay
                            isRuleValid={isRuleValid(
                              getLinearScaleRule(option, field),
                              field.temp_id || field.id,
                              formCustomFields
                            )}
                            answerTitle={getTitleFromAnswerId(
                              field,
                              getLinearScaleRule(option, field)?.if,
                              locale
                            )}
                            targetPage={getTitleFromPageId(
                              formCustomFields,
                              getLinearScaleRule(option, field)?.goto_page_id,
                              formatMessage(
                                builderConfig.formEndPageLogicOption ||
                                  messages.formEnd
                              ),
                              formatMessage(messages.page)
                            )}
                          />
                        </Box>
                      );
                    })}
                  {field.input_type === 'page' && (
                    <FieldRuleDisplay
                      isPageRule
                      isRuleValid={isPageRuleValid(
                        formCustomFields,
                        field.temp_id || field.id,
                        field.logic.next_page_id
                      )}
                      answerTitle={getIndexForTitle(formCustomFields, field)}
                      targetPage={getTitleFromPageId(
                        formCustomFields,
                        field.logic.next_page_id,
                        formatMessage(
                          builderConfig.formEndPageLogicOption ||
                            messages.formEnd
                        ),
                        formatMessage(messages.page)
                      )}
                      textColor={getIndexTitleColor(field.input_type)}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Box pr="32px" display="flex" height="100%" alignContent="center">
            {field.required && (
              <Box mt="auto" mb="auto" ml="12px">
                {' '}
                <Badge className="inverse" color={colors.green100}>
                  <Text
                    color="green500"
                    py="0px"
                    my="0px"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    <FormattedMessage {...messages.required} />
                  </Text>
                </Badge>
              </Box>
            )}
            {!isFieldGrouping && (
              <Box my="auto" ml="12px">
                {' '}
                <Badge className="inverse" color={colors.grey200}>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    flexWrap="nowrap"
                  >
                    <Icon
                      fill={colors.coolGrey600}
                      width="16px"
                      height="16px"
                      name={getFieldIcon(field.input_type, field.key)}
                    />
                    <Text
                      color="coolGrey600"
                      py="0px"
                      my="0px"
                      fontSize="xs"
                      fontWeight="bold"
                      ml="4px"
                      whiteSpace="nowrap"
                    >
                      <FormattedMessage {...getTranslatedFieldType(field)} />
                    </Text>
                  </Box>
                </Badge>
              </Box>
            )}
          </Box>
        </Box>
      </FlexibleRow>
    </FormFieldsContainer>
  );
};
