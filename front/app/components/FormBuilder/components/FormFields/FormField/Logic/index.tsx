import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import {
  ICustomFieldSettingsTab,
  IFlatCustomField,
} from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';

import { findNextPageAfterCurrentPage } from 'components/FormBuilder/utils';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isPageRuleValid, isRuleValid } from 'utils/yup/validateLogic';

import messages from '../../../messages';

import { PageRuleDisplay } from './PageRuleDisplay';
import { QuestionRuleDisplay } from './QuestionRuleDisplay';
import {
  getOptionRule,
  getLinearScaleRule,
  getLinearOrRatingOptions,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';

interface Props {
  field: IFlatCustomField;
  fieldNumbers: Record<string, number>;
  formCustomFields: IFlatCustomField[];
  formEndPageLogicOption?: MessageDescriptor;
  handleOpenSettings: (defaultTab: ICustomFieldSettingsTab) => void;
}

const Logic = ({
  field,
  fieldNumbers,
  formCustomFields,
  handleOpenSettings,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const pageMessage = formatMessage(messages.page);
  const lastPageMessage = formatMessage(messages.lastPage);

  // Add the additional catch all logic options
  const catchAllTypes = field.required
    ? ['any_other_answer']
    : ['any_other_answer', 'no_answer'];
  const catchAllLogicRules = (field.logic.rules || [])
    .filter((rule) => catchAllTypes.includes(rule.if.toString()))
    .sort((a, b) => a.if.toString().localeCompare(b.if.toString())); // sort to ensure consistent order
  const catchAllLogicMessages = {
    any_other_answer: formatMessage(messages.logicAnyOtherAnswer),
    no_answer: formatMessage(messages.logicNoAnswer),
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      pb="12px"
      mt="-8px"
    >
      {['select', 'multiselect', 'multiselect_image'].includes(
        field.input_type
      ) &&
        field.options &&
        field.options.map((option) => {
          const optionRule = getOptionRule(option, field);
          const key = `${field.temp_id || field.id}_${
            option.id || option.temp_id
          }`;

          return (
            <QuestionRuleDisplay
              key={key}
              isRuleValid={isRuleValid(
                optionRule,
                field.temp_id || field.id,
                formCustomFields
              )}
              answerTitle={getTitleFromAnswerId(field, optionRule?.if, locale)}
              targetPage={getTitleFromPageId(
                optionRule?.goto_page_id,
                pageMessage,
                fieldNumbers,
                formCustomFields,
                lastPageMessage
              )}
              handleOpenSettings={handleOpenSettings}
            />
          );
        })}

      {['linear_scale', 'rating'].includes(field.input_type) &&
        field.maximum &&
        getLinearOrRatingOptions(field.maximum).map((option) => {
          const linearScaleRule = getLinearScaleRule(option, field);
          const key = `${field.temp_id || field.id}_${option.key}`;

          return (
            <QuestionRuleDisplay
              key={key}
              isRuleValid={isRuleValid(
                linearScaleRule,
                field.temp_id || field.id,
                formCustomFields
              )}
              answerTitle={getTitleFromAnswerId(
                field,
                linearScaleRule?.if,
                locale
              )}
              targetPage={getTitleFromPageId(
                linearScaleRule?.goto_page_id,
                pageMessage,
                fieldNumbers,
                formCustomFields,
                lastPageMessage
              )}
              handleOpenSettings={handleOpenSettings}
            />
          );
        })}
      {field.input_type === 'page' && field.key !== 'form_end' && (
        <PageRuleDisplay
          isRuleValid={isPageRuleValid(
            formCustomFields,
            field.temp_id || field.id,
            field.logic.next_page_id
          )}
          targetPage={getTitleFromPageId(
            field.logic.next_page_id ||
              findNextPageAfterCurrentPage(formCustomFields, field.id),
            pageMessage,
            fieldNumbers,
            formCustomFields,
            lastPageMessage
          )}
          isDefaultPage={!field.logic.next_page_id}
          handleOpenSettings={handleOpenSettings}
        />
      )}
      {catchAllLogicRules.map((rule) => {
        const key = `${field.temp_id || field.id}_${rule.if}`;
        return (
          <QuestionRuleDisplay
            key={key}
            isRuleValid={isRuleValid(
              rule,
              field.temp_id || field.id,
              formCustomFields
            )}
            answerTitle={catchAllLogicMessages[rule.if.toString()]}
            targetPage={getTitleFromPageId(
              rule.goto_page_id,
              pageMessage,
              fieldNumbers,
              formCustomFields,
              lastPageMessage
            )}
            handleOpenSettings={handleOpenSettings}
          />
        );
      })}
    </Box>
  );
};

export default Logic;
