import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { QuestionRuleInput } from './QuestionRuleInput';
import { PageRuleInput } from './PageRuleInput';

// intl
import messages from '../../messages';
import { useIntl, FormattedMessage } from 'utils/cl-intl';

// services & hooks
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { useFormContext } from 'react-hook-form';

import { get } from 'lodash-es';

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
  const {
    watch,
    formState: { errors: formContextErrors },
  } = useFormContext();
  const locale = useLocale();
  const selectOptions = watch(`customFields.${field.index}.options`);
  const linearScaleMaximum = watch(`customFields.${field.index}.maximum`);

  if (isNilOrError(locale)) {
    return null;
  }

  const error = get(formContextErrors, `customFields.${field.index}.logic`);
  const validationError = error?.message as string | undefined;

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
      {field.input_type === 'page' ? (
        <>
          <Box mb="24px">
            <Warning>
              <FormattedMessage
                {...messages.pagesLogicHelperText}
                values={{
                  supportPageLink: (
                    <a
                      href={formatMessage(messages.surveySupportArticle)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.surveySupportArticleLinkText}
                      />
                    </a>
                  ),
                }}
              />
            </Warning>
          </Box>
          <PageRuleInput
            fieldId={field.temp_id || field.id}
            validationError={validationError}
            name={`customFields.${field.index}.logic`}
            pages={pageOptions}
          />
        </>
      ) : (
        <>
          <Box mb="24px">
            <Warning>
              <FormattedMessage
                {...messages.questionLogicHelperText}
                values={{
                  supportPageLink: (
                    <a
                      href={formatMessage(messages.surveySupportArticle)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.surveySupportArticleLinkText}
                      />
                    </a>
                  ),
                }}
              />
            </Warning>
          </Box>
          {answers &&
            answers.map((answer) => (
              <Box key={answer.key}>
                <QuestionRuleInput
                  fieldId={field.temp_id || field.id}
                  validationError={validationError}
                  name={`customFields.${field.index}`}
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
