import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { RuleInput } from './RuleInput';
import { PageRuleInput } from './PageRuleInput';

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

export type AnswersType =
  | {
      key: string | number;
      label: string | undefined;
    }[]
  | undefined;

export const LogicSettings = ({ pageOptions, field }: LogicSettingsProps) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();
  const locale = useLocale();
  const selectOptions = watch(`customFields.${field.index}.options`);
  const linearScaleMaximum = watch(`customFields.${field.index}.maximum`);

  if (isNilOrError(locale)) {
    return null;
  }
  // For Select Field
  let answers: AnswersType = selectOptions
    ? selectOptions
        .filter((selectOption) =>
          selectOption.title_multiloc[locale]?.toString()
        )
        .map((option) => ({
          key: option.id || option.temp_id,
          label: option.title_multiloc[locale]?.toString(),
        }))
    : undefined;
  // For Linear Scale Field
  if (field.input_type === 'linear_scale') {
    const linearScaleOptionArray = Array.from(
      { length: linearScaleMaximum },
      (_, i) => i + 1
    );
    answers = linearScaleOptionArray.map((option) => ({
      key: option,
      label: option.toString(),
    }));
  }

  return (
    <>
      <Box mb="24px">
        <Warning text={formatMessage(messages.logicWarning)} />
      </Box>
      {field.input_type === 'page' ? (
        <PageRuleInput
          name={`customFields.${field.index}.logic`}
          pages={pageOptions}
        />
      ) : (
        <>
          {answers &&
            answers.map((answer) => (
              <Box key={answer.key}>
                <RuleInput
                  name={`customFields.${field.index}.logic`}
                  answer={answer}
                  pages={pageOptions}
                />
              </Box>
            ))}
        </>
      )}
      <Box borderTop={`1px solid ${colors.divider}`} py="24px" />
    </>
  );
};
