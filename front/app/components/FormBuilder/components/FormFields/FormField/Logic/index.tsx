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
import { IFlatCustomField } from 'services/formCustomFields';

interface Props {
  field: IFlatCustomField;
  formCustomFields: IFlatCustomField[];
  formEndPageLogicOption?: MessageDescriptor;
}

const Logic = ({ field, formCustomFields, formEndPageLogicOption }: Props) => {
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

          return (
            <Box key={option.id}>
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
                  formCustomFields,
                  optionRule?.goto_page_id,
                  formEndMessage,
                  pageMessage
                )}
              />
            </Box>
          );
        })}
      {field.input_type === 'linear_scale' &&
        field.maximum &&
        getLinearScaleOptions(field.maximum).map((option) => {
          const linearScaleRule = getLinearScaleRule(option, field);

          return (
            <Box key={option.key}>
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
                  formCustomFields,
                  linearScaleRule?.goto_page_id,
                  formEndMessage,
                  pageMessage
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
            formCustomFields,
            field.logic.next_page_id,
            formEndMessage,
            pageMessage
          )}
        />
      )}
    </Box>
  );
};

export default Logic;
