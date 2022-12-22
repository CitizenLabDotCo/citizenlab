import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  isFieldSelected,
  getFieldBackgroundColor,
  getTitleColor,
  getIndexForTitle,
  getIndexTitleColor,
  getLinearScaleOptions,
  getLinearScaleRule,
  getOptionRule,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';

// components
import {
  Box,
  Badge,
  Text,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import T from 'components/T';
import { FlexibleRow } from '../FlexibleRow';

// styling
import styled from 'styled-components';

// hooks and services
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import useLocale from 'hooks/useLocale';
import { FieldRuleDisplay } from './FieldRuleDisplay';
import { isPageRuleValid, isRuleValid } from 'utils/yup/validateLogic';

const FormFieldsContainer = styled(Box)`
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  field: IFlatCustomField;
  isEditingDisabled: boolean;
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  getTranslatedFieldType: (fieldType: string) => MessageDescriptor;
  selectedFieldId?: string;
};

export const FieldElement = (props: Props) => {
  const {
    field,
    isEditingDisabled,
    onEditField,
    getTranslatedFieldType,
    selectedFieldId,
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
  let outlineStyle = 'none';
  if (hasErrors) {
    outlineStyle = `1px solid ${colors.error}`;
  } else if (
    isFieldSelected(selectedFieldId, field.id) &&
    field.input_type !== 'page'
  ) {
    outlineStyle = `1px solid ${colors.teal300}`;
  }

  const editFieldAndValidate = () => {
    onEditField({ ...field, index });
    trigger();
  };

  return (
    <FormFieldsContainer
      role={'button'}
      key={field.id}
      style={{ outline: outlineStyle, outlineOffset: '-1px' }}
      background={getFieldBackgroundColor(selectedFieldId, field)}
      onClick={() => {
        isEditingDisabled ? undefined : editFieldAndValidate();
      }}
      data-cy="e2e-field-row"
    >
      <FlexibleRow rowHeight={field.input_type === 'page' ? '50px' : '70px'}>
        <Box
          display="flex"
          justifyContent="space-between"
          className="expand"
          width="100%"
          ml={field.input_type === 'page' ? '8px' : '32px'}
        >
          <Box display="flex" alignItems="center" height="100%">
            <Box display="block">
              <Box>
                <Icon
                  ml="28px"
                  width="12px"
                  fill={getIndexTitleColor(selectedFieldId, field)}
                  name="sort"
                  pb="4px"
                />
                <Text
                  as="span"
                  color={getIndexTitleColor(selectedFieldId, field)}
                  fontSize="base"
                  mt="auto"
                  mb="auto"
                  fontWeight="bold"
                  mx="12px"
                >
                  <>
                    <FormattedMessage
                      {...(field.input_type === 'page'
                        ? messages.page
                        : messages.question)}
                    />
                    {getIndexForTitle(formCustomFields, field)}
                  </>
                </Text>
                <Text
                  as="span"
                  fontSize="base"
                  mt="auto"
                  mb="auto"
                  color={getTitleColor(selectedFieldId, field)}
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
                              formatMessage(messages.surveyEnd),
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
                              formatMessage(messages.surveyEnd),
                              formatMessage(messages.page)
                            )}
                          />
                        </Box>
                      );
                    })}
                  {field.input_type === 'page' && (
                    <FieldRuleDisplay
                      isRuleValid={isPageRuleValid(
                        formCustomFields,
                        field.temp_id || field.id,
                        field.logic.next_page_id
                      )}
                      answerTitle={getIndexForTitle(formCustomFields, field)}
                      targetPage={getTitleFromPageId(
                        formCustomFields,
                        field.logic.next_page_id,
                        formatMessage(messages.surveyEnd),
                        formatMessage(messages.page)
                      )}
                      textColor={getIndexTitleColor(selectedFieldId, field)}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Box pr="32px" display="flex" height="100%" alignContent="center">
            {!isNilOrError(field.input_type) && field.input_type !== 'page' && (
              <Box my="auto" ml="12px">
                {' '}
                <Badge className="inverse" color={colors.coolGrey600}>
                  <FormattedMessage
                    {...getTranslatedFieldType(field.input_type)}
                  />
                </Badge>
              </Box>
            )}
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
          </Box>
        </Box>
      </FlexibleRow>
    </FormFieldsContainer>
  );
};
