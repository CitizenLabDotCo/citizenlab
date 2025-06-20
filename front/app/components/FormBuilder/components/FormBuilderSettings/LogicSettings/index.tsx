import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import usePageList from '../usePageList';

import { PageRuleInput } from './PageRuleInput';
import { QuestionRuleInput } from './QuestionRuleInput';

export type PageListType =
  | {
      value: string | undefined;
      label: string;
      disabled?: boolean;
    }[];

type LogicSettingsProps = {
  field: IFlatCustomFieldWithIndex;
  builderConfig: FormBuilderConfig | undefined;
};

export type AnswersType =
  | {
      key: string | number;
      label: string | undefined;
    }[]
  | undefined;

const LogicSettings = ({ field, builderConfig }: LogicSettingsProps) => {
  const { formatMessage } = useIntl();
  const {
    watch,
    formState: { errors: formContextErrors },
  } = useFormContext();
  const locale = useLocale();
  const selectOptions = watch(`customFields.${field.index}.options`);
  const linearScaleMaximum = watch(`customFields.${field.index}.maximum`);
  const fieldRequired = watch(`customFields.${field.index}.required`);

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
  // For Linear Scale and Rating Fields
  if (['linear_scale', 'rating'].includes(field.input_type)) {
    const linearScaleOptionArray = Array.from(
      { length: linearScaleMaximum },
      (_, i) => i + 1
    );
    answers = linearScaleOptionArray.map((option) => ({
      key: option,
      label: option.toString(),
    }));
  }

  // Add options for 'any_other_answer' and 'no_answer'
  if (answers) {
    answers.push({
      key: 'any_other_answer',
      label: formatMessage(messages.logicPanelAnyOtherAnswer),
    });
    if (!fieldRequired) {
      answers.push({
        key: 'no_answer',
        label: formatMessage(messages.logicPanelNoAnswer),
      });
    }
  }
  const formCustomFields: IFlatCustomFieldWithIndex[] = watch('customFields');
  const fieldType = watch(`customFields.${field.index}.input_type`);
  const pageOptions = usePageList();
  // Which page is the current question on?
  // Technically there should always be a current page ID and null should never be returned
  const getCurrentPageId = (questionId: string): string | null => {
    if (fieldType === 'page') return field.id;

    let pageId: string | null = null;
    for (const field of formCustomFields) {
      if (field.input_type === 'page') pageId = field.id;
      if (field.id === questionId) return pageId;
    }
    return null;
  };
  // Current and previous pages should be disabled in select options
  let disablePage = true;
  const pages: PageListType = pageOptions.map((page) => {
    const newPage = {
      ...page,
      disabled: disablePage,
    };
    if (page.value === getCurrentPageId(field.id)) {
      disablePage = false;
    }
    return newPage;
  });

  return (
    <>
      {field.input_type === 'page' ? (
        <>
          <Box mb="24px">
            {builderConfig &&
              !isNilOrError(builderConfig.supportArticleLink) && (
                <Warning>
                  <FormattedMessage
                    {...(builderConfig.pagesLogicHelperText ||
                      messages.pagesLogicHelperText)}
                    values={{
                      supportPageLink: (
                        <a
                          href={formatMessage(builderConfig.supportArticleLink)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FormattedMessage
                            {...messages.supportArticleLinkText}
                          />
                        </a>
                      ),
                    }}
                  />
                </Warning>
              )}
          </Box>
          <PageRuleInput
            field={field}
            fieldId={field.temp_id || field.id}
            validationError={validationError}
            name={`customFields.${field.index}.logic`}
          />
        </>
      ) : (
        <>
          {['multiselect', 'multiselect_image'].includes(field.input_type) && (
            <Box mb="24px">
              {builderConfig &&
                !isNilOrError(builderConfig.supportArticleLink) && (
                  <Warning>
                    <FormattedMessage {...messages.multipleChoiceHelperText} />
                  </Warning>
                )}
            </Box>
          )}
          {answers &&
            answers.map((answer) => (
              <Box key={answer.key}>
                <QuestionRuleInput
                  fieldId={field.temp_id || field.id}
                  validationError={validationError}
                  name={`customFields.${field.index}`}
                  answer={answer}
                  pages={pages}
                />
              </Box>
            ))}
        </>
      )}
      <Box borderTop={`1px solid ${colors.divider}`} py="24px" />
    </>
  );
};

export default LogicSettings;
