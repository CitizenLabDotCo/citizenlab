import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { RuleInput } from './RuleInput';

// intl
import messages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// services & hooks
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

type LogicSettingsProps = {
  pageOptions: { value: string; label: string }[];
  field: IFlatCustomFieldWithIndex;
};
export const LogicSettings = ({ pageOptions, field }: LogicSettingsProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  if (isNilOrError(locale)) {
    return null;
  } else {
    // If select field
    let questions = field.options?.map((option) => ({
      label: option.title_multiloc['en']?.toString(),
    }));
    // If linear scale field
    if (field.input_type === 'linear_scale') {
      const linearScaleOptionArray = Array.from(
        { length: field.maximum },
        (_, i) => i + 1
      );
      questions = linearScaleOptionArray.map((option) => ({
        label: option.toString(),
      }));
    }

    return (
      <>
        <Box mb="24px">
          <Warning text={formatMessage(messages.logicWarning)} />
        </Box>
        {/* For each option in the field, provide the rule input */}
        {questions &&
          questions.map((question, i) => (
            <Box key={i}>
              <RuleInput
                questionTitle={question.label || ''}
                options={pageOptions}
              />
            </Box>
          ))}
        <Box borderTop={`1px solid ${colors.divider}`} py="24px" />
      </>
    );
  }
};
