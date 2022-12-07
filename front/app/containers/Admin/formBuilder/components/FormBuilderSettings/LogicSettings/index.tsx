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
import { useFormContext } from 'react-hook-form';

type LogicSettingsProps = {
  pageOptions: { value: string; label: string }[];
  field: IFlatCustomFieldWithIndex;
};
export const LogicSettings = ({ pageOptions, field }: LogicSettingsProps) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();
  const locale = useLocale();
  const selectOptions = watch(`customFields.${field.index}.options`);
  const linearScaleMaximum = watch(`customFields.${field.index}.maximum`);

  if (isNilOrError(locale)) {
    return null;
  } else {
    // Select Field
    let answers = selectOptions.map((option) => ({
      key: option.id?.toString(),
      label: option.title_multiloc[locale]?.toString(),
    }));
    // Linear Scale Field
    if (field.input_type === 'linear_scale') {
      const linearScaleOptionArray = Array.from(
        { length: linearScaleMaximum },
        (_, i) => i + 1
      );
      answers = linearScaleOptionArray.map((option) => ({
        key: option.toString(),
        label: option.toString(),
      }));
    }

    return (
      <>
        <Box mb="24px">
          <Warning text={formatMessage(messages.logicWarning)} />
        </Box>
        {/* For each option in the field, provide the rule input */}
        {answers &&
          answers.map((answer, i) => (
            <Box key={i}>
              <RuleInput
                name={`customFields.${field.index}.logic`}
                answer={answer}
                pages={pageOptions}
              />
            </Box>
          ))}
        <Box borderTop={`1px solid ${colors.divider}`} py="24px" />
      </>
    );
  }
};
