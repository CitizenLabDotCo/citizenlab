import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isPageRuleValid, isRuleValid } from 'utils/yup/validateLogic';

import messages from '../../../messages';

import { PageRuleDisplay } from './PageRuleDisplay';
import { QuestionRuleDisplay } from './QuestionRuleDisplay';
import {
  getOptionRule,
  getLinearScaleRule,
  getLinearScaleOptions,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';

interface Props {
  field: IFlatCustomField;
  fieldNumbers: Record<string, number>;
  formCustomFields: IFlatCustomField[];
  formEndPageLogicOption?: MessageDescriptor;
}

const Logic = ({
  field,
  fieldNumbers,
  formCustomFields,
  formEndPageLogicOption,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const formEndMessage = formatMessage(
    formEndPageLogicOption || messages.formEnd
  );

  const pageMessage = formatMessage(messages.page);

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
    <Box>
      {field.input_type === 'select' &&
        field.options &&
        field.options.map((option) => {
          const optionRule = getOptionRule(option, field);
          const key = `${field.temp_id || field.id}_${
            option.id || option.temp_id
          }`;

          return (
            <Box key={key}>
              <QuestionRuleDisplay
                isRuleValid={isRuleValid(
                  optionRule,
                  field.temp_id || field.id,
                  formCustomFields
                )}
                answerTitle={getTitleFromAnswerId(
                  field,
                  optionRule?.if,
                  locale
                )}
                targetPage={getTitleFromPageId(
                  optionRule?.goto_page_id,
                  formEndMessage,
                  pageMessage,
                  fieldNumbers
                )}
              />
            </Box>
          );
        })}

      {field.input_type === 'linear_scale' &&
        field.maximum &&
        getLinearScaleOptions(field.maximum).map((option) => {
          const linearScaleRule = getLinearScaleRule(option, field);
          const key = `${field.temp_id || field.id}_${option.key}`;

          return (
            <Box key={key}>
              <QuestionRuleDisplay
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
                  formEndMessage,
                  pageMessage,
                  fieldNumbers
                )}
              />
            </Box>
          );
        })}
      {field.input_type === 'page' && (
        <PageRuleDisplay
          isRuleValid={isPageRuleValid(
            formCustomFields,
            field.temp_id || field.id,
            field.logic.next_page_id
          )}
          targetPage={getTitleFromPageId(
            field.logic.next_page_id,
            formEndMessage,
            pageMessage,
            fieldNumbers
          )}
        />
      )}
      {catchAllLogicRules.map((rule) => {
        const key = `${field.temp_id || field.id}_${rule.if}`;
        return (
          <Box key={key}>
            <QuestionRuleDisplay
              isRuleValid={isRuleValid(
                rule,
                field.temp_id || field.id,
                formCustomFields
              )}
              answerTitle={catchAllLogicMessages[rule.if.toString()]}
              targetPage={getTitleFromPageId(
                rule.goto_page_id,
                formEndMessage,
                pageMessage,
                fieldNumbers
              )}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default Logic;
