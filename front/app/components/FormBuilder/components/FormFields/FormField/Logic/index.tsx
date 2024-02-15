import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { QuestionRuleDisplay } from './QuestionRuleDisplay';
import { PageRuleDisplay } from './PageRuleDisplay';

// i18n
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';
import useLocale from 'hooks/useLocale';

// utils
import { isPageRuleValid, isRuleValid } from 'utils/yup/validateLogic';
import {
  getOptionRule,
  getLinearScaleRule,
  getLinearScaleOptions,
  getTitleFromAnswerId,
  getTitleFromPageId,
} from './utils';

// typings
import { IFlatCustomField } from 'api/custom_fields/types';

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
    </Box>
  );
};

export default Logic;
