import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import { getFieldNumbers } from '../../utils';

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
  getCurrentPageId: (questionId: string) => string | null;
};

export type AnswersType =
  | {
      key: string | number;
      label: string | undefined;
    }[]
  | undefined;

const LogicSettings = ({
  field,
  builderConfig,
  getCurrentPageId,
}: LogicSettingsProps) => {
  const { formatMessage } = useIntl();
  const {
    watch,
    formState: { errors: formContextErrors },
  } = useFormContext();
  const locale = useLocale();
  const localize = useLocalize();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
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

  const getPageList = () => {
    const fieldNumbers = getFieldNumbers(formCustomFields);
    const pageArray: { value: string; label: string }[] = [];

    formCustomFields.forEach((field, i) => {
      if (field.input_type === 'page') {
        const isLastPage = i === formCustomFields.length - 1;

        const pageTitle = localize(field.title_multiloc);
        const pageLabel = isLastPage
          ? formatMessage(messages.lastPage)
          : `${formatMessage(messages.page)} ${fieldNumbers[field.id]}${
              pageTitle
                ? `: ${
                    pageTitle.length > 25
                      ? `${pageTitle.slice(0, 25)}...`
                      : pageTitle
                  }`
                : ''
            }`;

        pageArray.push({
          value: field.temp_id || field.id,
          label: pageLabel,
        });
      }
    });
    return pageArray;
  };

  const pageOptions = getPageList();

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
            fieldId={field.temp_id || field.id}
            validationError={validationError}
            name={`customFields.${field.index}.logic`}
            pages={pages}
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
